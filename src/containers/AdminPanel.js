import React, { Component } from "react";
import ReactTable from 'react-table';
import "react-table/react-table.css";
import "./Home.css";
import appconfig from '../Config/appconfig'
import { fileServices } from '../services/fileServices'


class AdminPanel extends Component {
    constructor(props) {
        super(props); 
        this.state = {
            filesdata:[]
        };
    }    
    
    componentDidMount(){
        this.getFilesData();
    }
    getFilesData() {
        fetch("http://localhost:4001/allusers")
        .then(response => response.json().then(filesdata =>{            
            this.setState({filesdata: filesdata})
            }));
    }      
    fileDownload(fileName){
        const filePath = appconfig.cloudFrontDomainName + '/' + fileName;
        console.log(filePath);
        //window.open(filePath, "_blank")
        var xhr = new XMLHttpRequest();
        xhr.open("GET", filePath, true);
        xhr.responseType = "blob";
        xhr.onload = function(){
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement('a');
            tag.href = imageUrl;
            tag.download = fileName;
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        }
        xhr.send();
    }
    deleteFile(fileId, fileName){
        fileServices.deleteFile(fileId, fileName)
        .then(response => {
            this.deleteFileData(fileId);
        })
    }
    deleteFileData(fileId){
        fileServices.deleteFileData(fileId)
        .then(res =>{
            this.getFilesData();
        })
    }
    render() {
      const columns=[
          {
              Header: "User Name",
              accessor: "Email"
          },
          {
              Header: "User Email",
              accessor: "Imageurl"
          },
          {
              Header: "File Name",
              accessor: "FileName"
          },
          {
              Header: "File Description",
              accessor: "FileDescription"
          },
          {
              Header: "File Upload Time",
              accessor: "CreatedAt"
          },
          {
              Header: "File Update Time",
              accessor: "UpdatedAt"
          },
          {
            Header: "Action",
            Cell: props =>{
                return(
                    <button type="submit" onClick={()=> this.fileDownload(props.original.FileName)
                    }>Download</button>
                    //<a target="_blank" role="button" href="${appConfig.cloudFrontDomainName}/{props.original.FileName}" download>Download!</a>
                )
            }
        },
        {
            Header: "Action",
            Cell: props =>{
                return(
                    <button 
                    onClick={()=>
                    this.deleteFile(props.original.Id, props.original.FileName)
                    //this.deleteFileData(props.original.id, props.original.Email)
                    }>Delete</button>
                )
            }
        }
      ];
    return (
      <div className="FileStore">        
        <div className="row">   </div>
        <div className="row"> <p className="App-intro">.</p> </div>
        <div className="row">
            <ReactTable
            columns={columns}
            data={this.state.filesdata}
            defaultPageSize={10}
            className="-striped -highlight">
            </ReactTable>
        </div>
    </div>      
    );
  }
}

export default AdminPanel;