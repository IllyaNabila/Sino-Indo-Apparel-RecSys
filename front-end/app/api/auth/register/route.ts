import {connect} from "@/dbConfig/dbConfig"
import User from "@/models/userModel"
import {NextRequest, NextResponse} from 'next/server';
import bcryptjs from 'bcryptjs'
import jwt from "jsonwebtoken";
import { ConflictError, ValidationError } from "@/lib/errors";
import { withErrorHandler } from "@/lib/withErrorHandler";

connect()

export const POST = withErrorHandler(async (request: NextRequest) => {
        const reqBody = await request.json()
        const {email, password, role} = reqBody

        const PASSWORD_RULE =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

        if (!PASSWORD_RULE.test(password)) {
            throw new ValidationError("Password must be 8+ chars and include uppercase, lowercase, number, and symbol.")
        }

        console.log(reqBody);
        
        // Check if user already exists
        const user = await User.findOne({email})

        if(user) {
            throw new ConflictError("User already exists");
        }

        //hash password 
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            email,
            password: hashedPassword,
            role
        })

        const savedUser = await newUser.save()
        console.log(savedUser);

        // create token data
        const tokenData = {
            id: savedUser._id,
            email: savedUser.email
        }
        
        //create token 
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: '1d'})


        const response = NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser
        })

        response.cookies.set("token", token, {
            httpOnly: true,
        })
        return response;
});