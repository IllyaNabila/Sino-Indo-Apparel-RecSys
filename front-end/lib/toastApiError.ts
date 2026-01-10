//front-end\lib\toastApiError.ts
import toast from "react-hot-toast";
import axios from "axios";

export function toastApiError(err: unknown) {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    const code = data?.error?.code;
    const message =
      data?.error?.message ||
      data?.message ||
      err.message ||
      "Something went wrong";

    if (code === "UNAUTHORIZED") return toast.error("Invalid credentials.");
    if (code === "FORBIDDEN") return toast.error("You don't have access.");
    if (code === "INVALID_JSON") return toast.error("Invalid form data.");

    // show backend message for these
    if (code === "NOT_FOUND") return toast.error(message);
    if (code === "VALIDATION_ERROR") return toast.error(message);

    return toast.error(message);
  }

  console.error(err);
  return toast.error("Something went wrong.");
}