import {connect} from "@/dbConfig/dbConfig"
import User from "@/models/userModel"
import {NextRequest, NextResponse} from 'next/server';
import bcryptjs from 'bcryptjs'
import jwt from "jsonwebtoken";

connect()

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json()
        const {email, password, role} = reqBody

        console.log(reqBody);
        
        // Check if user already exists
        const user = await User.findOne({email})

        if(user) {
            return NextResponse.json({error: "User already exists"}, {status: 400})
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
        
    } catch (error: any) {
      return NextResponse.json({error: error.message},
        {status: 500})
    }
}