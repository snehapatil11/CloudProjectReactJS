import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth'
import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { config as AWSConfig } from 'aws-sdk'
//import appConfig from '../Config/appconfig.json'
//const appConfig = {}

AWSConfig.region = "us-east-2";

const getCognitoDetails = () => {
  fetch("http://localhost:4001/cognitodetails")
  .then(response => response.json().then(appConfig =>{
    appConfig = appConfig;
    console.log(appConfig);
    localStorage.setItem("appConfig",JSON.stringify(appConfig));
  }))        
}
// Creates a CognitoAuth instance
const createCognitoAuth = () => {
  var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  var token = [
    "openid",
    "email",
    "profile"
]
  const appWebDomain = appConfig.userPoolBaseUri.replace('https://', '').replace('http://', '')
  const auth = new CognitoAuth({
    UserPoolId: appConfig.userPool,
    ClientId: appConfig.clientId,
    AppWebDomain: appWebDomain,
    TokenScopesArray: token,
    RedirectUriSignIn: appConfig.callbackUri,
    RedirectUriSignOut: appConfig.signoutUri
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
  var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  return new CognitoUserPool({  
    UserPoolId: appConfig.userPool,
    ClientId: appConfig.clientId
  })
}

// Get the URI of the hosted sign in screen
const getCognitoSignInUri = () => {
  var appConfig = JSON.parse(localStorage.getItem("appConfig"));
  console.log("in geturi",appConfig.userPoolBaseUri);
  const signinUri = `${appConfig.userPoolBaseUri}/login?response_type=code&client_id=${appConfig.clientId}&redirect_uri=${appConfig.callbackUri}`
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