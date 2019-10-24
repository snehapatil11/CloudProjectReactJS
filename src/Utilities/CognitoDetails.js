import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth'
import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { config as AWSConfig } from 'aws-sdk'
//import appConfig from '../Config/appconfig.json'

AWSConfig.region = "us-east-2";

const createCognitoAuth = () => {
  //var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  var token = [
    "openid",
    "email",
    "profile"
  ]
  const appWebDomain = process.env.REACT_APP_userPoolBaseUri.replace('https://', '').replace('http://', '')
  const auth = new CognitoAuth({
    UserPoolId: process.env.REACT_APP_userPool,
    ClientId: process.env.REACT_APP_clientId,
    AppWebDomain: appWebDomain,
    TokenScopesArray: token,
    RedirectUriSignIn: process.env.REACT_APP_callbackUri,
    RedirectUriSignOut: process.env.REACT_APP_signoutUri
  })
  return auth
}

// Creates Cognito User
const createCognitoUser = () => {
  const userpool = createCognitoUserPool()
  return userpool.getCurrentUser()
}

// Creates Cognito UserPool
const createCognitoUserPool = () => {
  //var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  return new CognitoUserPool({  
    UserPoolId: process.env.REACT_APP_userPool,
    ClientId: process.env.REACT_APP_clientId
  })
}

const getCognitoSignInUri = () => {
  //var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  console.log("in geturi",process.env.REACT_APP_callbackUri);
  const signinUri = `${process.env.REACT_APP_userPoolBaseUri}/login?response_type=code&client_id=${process.env.REACT_APP_clientId}&redirect_uri=${process.env.REACT_APP_callbackUri}`
  return signinUri
}

const parseCognitoWebResponse = (href) => {
  return new Promise((resolve, reject) => {
    const auth = createCognitoAuth()

    // userHandler will trigger the promise
    auth.userhandler = {
      onSuccess: function (result) {
        localStorage.setItem("result",result);
        //console.log("parseCognitoWebResponse  : ",result);
        resolve(result)
      },
      onFailure: function (err) {
        var res = localStorage.getItem("result");
        resolve(res);
        //reject(new Error('Failure parsing Cognito web response: ' + err))
      }
    }
    auth.parseCognitoWebResponse(href)
    //console.log("done parseCognitoWebResponse ");
  })
}

const getCognitoSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = createCognitoUser()
    cognitoUser.getSession((err, result) => {
      if (err || !result) {
        reject(new Error('Failure getting Cognito session: ' + err))
        return
      }
      const session = {
        credentials: {
          accessToken: result.accessToken.jwtToken,
          idToken: result.idToken.jwtToken,
          refreshToken: result.refreshToken.token
        },
        user: {
          userName: result.idToken.payload['cognito:username'],
          email: result.idToken.payload.email,
          groups:result.idToken.payload['cognito:groups']
        }
      }
      resolve(session)
    })
  })
}

const signOutCognitoSession = () => {
  const auth = createCognitoAuth()
  auth.signOut()
}

export default {
  createCognitoAuth,
  createCognitoUser,
  createCognitoUserPool,
  getCognitoSession,
  getCognitoSignInUri,
  parseCognitoWebResponse,
  signOutCognitoSession
}