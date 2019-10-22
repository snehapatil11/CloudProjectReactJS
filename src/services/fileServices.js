const uuidv4 = require('uuid/v4');

export const fileServices  = {
    getFilesData,
    getFile,
    storefiledata,
    updateFileData,
    deleteFile,
    deleteFileData
}

function getFilesData(email) 
{
    return fetch(`${process.env.REACT_APP_endPointUrl}/users/`+ email)
    .then(response => {
        return response.json()
    })    
}

function getFile(filename) 
{
    return fetch(`${process.env.REACT_APP_endPointUrl}/file/`+ filename)
    .then(response => {
        return response.json()
    })    
}

function updateFileData(fileId){
    //var time = new Date().toDateString() + " " + new Date().toLocaleTimeString();
    
    return fetch(`${process.env.REACT_APP_endPointUrl}/updatefiledata/`+fileId)
    .then(response => {
        return response.json()
    })
}

function storefiledata(imageurl, filename, username, email, description){

    const url=`${process.env.REACT_APP_endPointUrl}/postusers`;
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
    const url=`${process.env.REACT_APP_endPointUrl}/api/filedelete`;
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
    const url = `${process.env.REACT_APP_endPointUrl}/deletefiledata/` + fileId;
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