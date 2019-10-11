import appconfig from '../Config/appconfig'
const uuidv4 = require('uuid/v4');

export const fileServices  = {
    getFilesData,
    storefiledata
}

function getFilesData() 
{
    return fetch(`${appconfig.endPointUrl}/users`)
    .then(response => {
        return response.json()
    })
}
function storefiledata(imageurl, filename, description){
    const url=`${appconfig.endPointUrl}/postusers`;
    return fetch(url, {
            method: 'Post',
            body: JSON.stringify({
                "Id": uuidv4(),
                "Email": "SnehaOnkar",
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