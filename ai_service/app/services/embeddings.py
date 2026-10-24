# backend/services/embeddings.py
import os
import urllib.request
import numpy as np

MODEL_DIR = os.path.join("/tmp", "all-MiniLM-L6-v2-onnx")
ONNX_URL = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx"
TOKENIZER_URL = "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json"

_ort_session = None
_tokenizer = None
_st_model = None


def _load_onnx_model():
    global _ort_session, _tokenizer
    if _ort_session is not None and _tokenizer is not None:
        return _ort_session, _tokenizer

    import onnxruntime as ort
    from tokenizers import Tokenizer

    os.makedirs(MODEL_DIR, exist_ok=True)
    onnx_path = os.path.join(MODEL_DIR, "model.onnx")
    tokenizer_path = os.path.join(MODEL_DIR, "tokenizer.json")

    if not os.path.exists(tokenizer_path):
        print("Downloading tokenizer.json from HuggingFace CDN...")
        urllib.request.urlretrieve(TOKENIZER_URL, tokenizer_path)

    if not os.path.exists(onnx_path):
        print("Downloading all-MiniLM-L6-v2 model.onnx from HuggingFace CDN...")
        urllib.request.urlretrieve(ONNX_URL, onnx_path)

    tok = Tokenizer.from_file(tokenizer_path)
    tok.enable_truncation(max_length=256)
    tok.enable_padding(pad_id=0, pad_token="[PAD]")

    sess_options = ort.SessionOptions()
    sess_options.intra_op_num_threads = 1
    sess_options.inter_op_num_threads = 1
    sess = ort.InferenceSession(onnx_path, sess_options=sess_options, providers=["CPUExecutionProvider"])

    _tokenizer = tok
    _ort_session = sess
    print("ONNX all-MiniLM-L6-v2 model loaded successfully.")
    return _ort_session, _tokenizer


def get_embedding(text: str):
    try:
        sess, tok = _load_onnx_model()
        encoded = tok.encode(str(text or ""))
        input_ids = np.array([encoded.ids], dtype=np.int64)
        attention_mask = np.array([encoded.attention_mask], dtype=np.int64)
        token_type_ids = np.array([encoded.type_ids], dtype=np.int64)

        input_names = {inp.name for inp in sess.get_inputs()}
        ort_inputs = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
        }
        if "token_type_ids" in input_names:
            ort_inputs["token_type_ids"] = token_type_ids

        outputs = sess.run(None, ort_inputs)
        token_embeddings = outputs[0]  # (1, seq_len, 384)

        mask_expanded = np.broadcast_to(
            np.expand_dims(attention_mask, -1), token_embeddings.shape
        ).astype(np.float32)
        sum_embeddings = np.sum(token_embeddings * mask_expanded, axis=1)
        sum_mask = np.clip(mask_expanded.sum(axis=1), a_min=1e-9, a_max=None)
        emb = sum_embeddings / sum_mask

        norm = np.linalg.norm(emb, axis=1, keepdims=True)
        emb = emb / np.clip(norm, a_min=1e-9, a_max=None)
        return emb[0].astype(float).tolist()
    except ImportError:
        global _st_model
        if _st_model is None:
            from sentence_transformers import SentenceTransformer
            _st_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        return _st_model.encode(str(text or "")).tolist()