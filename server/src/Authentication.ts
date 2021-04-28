import * as path from "path";
import { Constants } from "./Constants";

const Datastore = require("nedb");
const bcrypt = require("bcrypt");
const passwordValidator = require('password-validator');
import {logger} from "./Logger";

//Interface to define UserInfo data format for consumers of this class.
export interface IUserInfo {
    _id?: string,
    name: string,
    nameSearchField?: string,
    email?: string,
    emailSearchField?: string,
    password?: string,
    loginAttempts: number,
}

//Interface to define UserRegisterInfo data format for consumers of this class.
export interface IUserRegisterInfo {
    _id?: string,
    name: string,
    nameSearchField: string,
    email: string,
    emailSearchField: string,
    password: string,
    loginAttempts: number,
}

//Interface to define UserLoginInfo data format for consumers of this class.
export interface IUserLoginInfo {
    _id?: string,
    name: string,
    nameSearchField?: string,
    email?: string,
    emailSearchField?: string,
    password: string,
    loginAttempts?: number,
}

//Interface to define ErrorMessage data format for consumers of this class.
export interface IErrorMessage {
    message?: string,
}

/*
* This class is used for Logging in and Registering Users.  It also
* performs database operations to search for users and add users
*/
export class Authentication {
    private db: Nedb;
    private schema: any;

    constructor() {
        this.db = new Datastore({ filename: path.join(Constants.DATABASE_DIR, "users.db"), autoload: true });
    
        this.schema = new passwordValidator();
        this.schema.is().min(8)                                    
                    .is().max(75)                                  
                    .has().uppercase()                              
                    .has().lowercase()                              
                    .has().digits(1)                               
                    .has().not().spaces()                           
    }

    /**
    * Registers a new user and encrypts password. If an error occurs the
    * consumer of this function can obtain the error from the errorMessage 
    * parameter as call by reference.
    * @param inUserRegisterInfo user info in IUserRegisterInfo format
    * @param errorMessage will contain error message for function consumer
    * @returns Promise of type boolean      
    */
    public async register(inUserRegisterInfo: IUserRegisterInfo, errorMessage: IErrorMessage): Promise<boolean> {
       
        if (!this.schema.validate(inUserRegisterInfo.password)) {
            errorMessage.message = "User password invalid";
            return false;
        }
        
        inUserRegisterInfo.nameSearchField = inUserRegisterInfo.name.toLowerCase();
        const user: IUserInfo[] = await this.searchUserByName(inUserRegisterInfo.nameSearchField);
        if (user != null) {
            if (user.length > 0) {
                errorMessage.message = "User name is a duplicate";
                return false;
            }
        }

        inUserRegisterInfo.emailSearchField = inUserRegisterInfo.email.toLowerCase();
        const user2: IUserInfo[] = await this.searchUserByEmail(inUserRegisterInfo.emailSearchField);
        if (user2 != null) {
            if (user2.length > 0) {
                errorMessage.message = "Email is a duplicate";
                return false;
            }
        }

        const hashedPassword = await bcrypt.hash(inUserRegisterInfo.password, 10);
        inUserRegisterInfo.password = hashedPassword;
        inUserRegisterInfo.loginAttempts = 0;
        await this.addUser(inUserRegisterInfo);
        return true;
    }

    /**
    * Adds new user to NoSQL database
    * @param inUserRegisterInfo user info in IUserRegisterInfo format
    * @returns Promise of type boolean  
    */
    private addUser(inUserRegisterInfo: IUserRegisterInfo): Promise<boolean> {
        return new Promise((inResolve, inReject) => {
            this.db.insert(inUserRegisterInfo, (inError: Error | null, inNewDoc: IUserInfo) => {
                if (inError) {
                    logger.error("Authentication addUser()", inError);
                    inReject(inError);
                } else {
                    inResolve(true);
                }
            });
        });
    }

    /**
    * Authenticates a user by comparing the hashed password the user passed in with the
    * hashed password in the database.  If an error occurs the
    * consumer of this function can obtain the error from the errorMessage 
    * parameter as call by reference.
    * @param inUserLoginInfo user info in IUserLoginInfo format
    * @param errorMessage will contain error message for function consumer
    * @return Promise of type IUserInfo
    */
    public async authenticateUser(inUserLoginInfo: IUserLoginInfo, errorMessage: IErrorMessage): Promise<IUserInfo | null> {
        
        if(inUserLoginInfo.email == null){
            errorMessage.message = "User email is missing";
            return null;
        }

        if (!this.schema.validate(inUserLoginInfo.password)) {
            errorMessage.message = "User password invalid";
            return null;
        }

        //search using lower case
        const user: IUserInfo[] = await this.searchUserByEmail(inUserLoginInfo.email.toLowerCase());
        if (user == null) {
            errorMessage.message = "User not found";
            return null;
        } else if (user.length == 0) {
            errorMessage.message = "User not found";
            return null;
        } else if (user.length > 1) {
            errorMessage.message = "Error: Duplicate Users";
            return null;
        }else if(user[0].loginAttempts > Constants.MAX_LOGIN_ATTEMPS ){
            errorMessage.message = "Account locked";
            return null;
        }

        if(user[0].loginAttempts == null){
            user[0].loginAttempts = 0;
        }
        
        if (await bcrypt.compare(inUserLoginInfo.password, user[0].password)) {
            const numberReplaced: number = await this.updateUserLoginAttempts(user[0].name, 0);
            return ({
                name: user[0].name,
                email: user[0].email,
                loginAttempts: user[0].loginAttempts,
            });
        } else {
            //increase count of failed login attempts.
            const numberReplaced: number = await this.updateUserLoginAttempts(user[0].name, user[0].loginAttempts + 1);
            errorMessage.message = "Incorrect Password";
            return null;
        }

    }

    /**
    * Searches NoSQL DB for user.  If the IUserInfo[] length > 1 than that is
    * indicative of a problem.  But the consumer needs to handle that issue. 
    * @param inUserName
    * @returns Promise of IUserInfo[] type     
    */
    private searchUserByName(inUserName: string): Promise<IUserInfo[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({ nameSearchField: inUserName },
                (inError: Error, inDoc: IUserInfo[]) => {
                    if (inError) {
                        logger.error("Authentication searchUserByName()", inError);
                        inReject(inError);
                    } else {
                        inResolve(inDoc);
                    }
                });
        })
    }

    /**
    * Searches NoSQL DB for user by email.  If the IUserInfo[] length > 1 than that is
    * indicative of a problem.  But the consumer needs to handle that issue.
    * @param inUserEmail
    * @returns Promise of type IUserInfo[] 
    */
    private searchUserByEmail(inUserEmail: string): Promise<IUserInfo[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({ emailSearchField: inUserEmail },
                (inError: Error, inDoc: IUserInfo[]) => {
                    if (inError) {
                        logger.error("Authentication searchUserByEmail()", inError);
                        inReject(inError);
                    } else {
                        inResolve(inDoc);
                    }
                });
        })
    }

    /**
    * Updates database with number of unsuccessful login attempts.  Eventually the 
    * user will be locked out if they exceed number of allowable attempts.
    * @param inUserName
    * @param attemptNumber
    * @returns Promise of type number    
    */
    private updateUserLoginAttempts(inUserName: string, attemptNumber: number): Promise<number> {
        return new Promise((inResolve, inReject) => {
            this.db.update({ name: inUserName },{$set: {loginAttempts: attemptNumber}},{},
                (inError: Error | null, inNumberReplaced: number, upsert: boolean) => {
                    if (inError) {
                        logger.error("Authentication updateUserLoginAttempts()", inError);
                        inReject(inError);
                    } else {
                        inResolve(inNumberReplaced);
                    }
                });
        })
    }

    /**
    * This is called when a user logs off so session can be terminated.
    * @param inRequest
    * @returns Promise of type boolean   
    */
    public destroySession(inRequest: any): Promise<boolean> {
        return new Promise((inResolve, inReject) => {
            inRequest.session.destroy((inError: Error) => {
                if (inError) {
                    logger.error("Authentication destroySession()", inError);
                    inReject(inError);
                } else {
                    inResolve(true);
                }
            });
        });
    }

}