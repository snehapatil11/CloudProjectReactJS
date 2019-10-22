import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth'
import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { config as AWSConfig } from 'aws-sdk'
//import appConfig from '../Config/appconfig.json'

AWSConfig.region = "us-east-2";

console.log("client id", process.env.REACT_APP_region);

const getCognitoDetails = () => {
  fetch("http://localhost:4001/cognitodetails")
  .then(response => response.json().then(appConfig =>{
    appConfig = appConfig;
    console.log(appConfig);
    //localStorage.setItem("appConfig",JSON.stringify(appConfig));
  }))        
}
// Creates a CognitoAuth instance
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

// Creates a CognitoUser instance
const createCognitoUser = () => {
  const pool = createCognitoUserPool()
  return pool.getCurrentUser()
}

// Creates a CognitoUserPool instance
const createCognitoUserPool = () => {
  //var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  return new CognitoUserPool({  
    UserPoolId: process.env.REACT_APP_userPool,
    ClientId: process.env.REACT_APP_clientId
  })
}

// Get the URI of the hosted sign in screen
const getCognitoSignInUri = () => {
  //var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  console.log("in geturi",process.env.REACT_APP_userPoolBaseUri);
  const signinUri = `${process.env.REACT_APP_userPoolBaseUri}/login?response_type=code&client_id=${process.env.REACT_APP_clientId}&redirect_uri=${process.env.REACT_APP_callbackUri}`
  return signinUri
}

// Parse the response from a Cognito callback URI (assumed a token or code is in the supplied href). Returns a promise.
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

// Gets a new Cognito session. Returns a promise.
const getCognitoSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = createCognitoUser()
    cognitoUser.getSession((err, result) => {
      if (err || !result) {
        reject(new Error('Failure getting Cognito session: ' + err))
        return
      }

      // Resolve the promise with the session credentials
      //console.log('Successfully got session: ' + JSON.stringify(result))
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

// Sign out of the current session (will redirect to signout URI)
const signOutCognitoSession = () => {
  const auth = createCognitoAuth()
  auth.signOut()
}

export default {
  getCognitoDetails,
  createCognitoAuth,
  createCognitoUser,
  createCognitoUserPool,
  getCognitoSession,
  getCognitoSignInUri,
  parseCognitoWebResponse,
  signOutCognitoSession
}