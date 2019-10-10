import React, { Component } from "react";
import ReactTable from 'react-table';
import "react-table/react-table.css";
import "./Home.css";

class AdminPanel extends Component {
    constructor(props) {
        super(props); 
        this.state = {
            filesdata:[]
        };
    }
    
    getFilesData() {
        fetch("http://localhost:4001/users")
        .then(response => response.json().then(filesdata =>{            
            this.setState({filesdata: filesdata})
            }));
    }
    componentDidMount(){
        this.getFilesData();
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
                      <a href="https://cloudstoragebucket1.s3.us-east-2.amazonaws.com/rose_bud_orange_125198_168x300.jpg">Download!</a>
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