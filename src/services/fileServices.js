import appconfig from '../Config/appconfig'
const uuidv4 = require('uuid/v4');

export const fileServices  = {
    getFilesData,
    storefiledata,
    deleteFile,
    deleteFileData
}

function getFilesData(email) 
{
    return fetch(`${appconfig.endPointUrl}/users/`+ email)
    .then(response => {
        return response.json()
    })    
}

function storefiledata(imageurl, filename, username, email, description){

    const url=`${appconfig.endPointUrl}/postusers`;
    return fetch(url, {
            method: 'Post',
            body: JSON.stringify({
                "Id": uuidv4(),
                "UserName": username,
                "Email": email,
                "FileName":filename,
                "FileDescription":description,
                "CreatedAt":new Date().toDateString() + " " + new Date().toLocaleTimeString(),
                "UpdatedAt":new Date().toDateString() + " " + new Date().toLocaleTimeString(),
                "Imageurl": imageurl,
            }),
            headers: {
                'Content-Type': 'application/json'
              }
        }).then(res => {return res})
}

function deleteFile(fileId, fileName){
    const url=`${appconfig.endPointUrl}/api/filedelete`;
    return fetch(url, {
        method: 'Post',
        body: JSON.stringify({
            "fileName": fileName
        }),
        headers: {
            'Content-Type': 'application/json'
          }
    }).then(response => {
        return response;
    });
}

function deleteFileData(fileId){
    const url = `${appconfig.endPointUrl}/deletefiledata/` + fileId;
    return fetch(url, {
        method: 'delete'
        }).then(response =>{
            return response;        
            // response.json().then(json => {
            //     console.log(json);
            //     this.getFilesData();
            //   return json;
            // })
        });
}