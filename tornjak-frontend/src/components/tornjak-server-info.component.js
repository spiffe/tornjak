import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serverSelected
} from '../actions';

const TornjakServerInfoDisplay = props => (
    <p>
    <pre>
        {props.tornjakServerInfo}
    </pre>
    </p>
)

class TornjakServerInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        tornjakServerInfo: "",
        servers: [],
        selectedServer: "",
        message: "",
    };
  }

  componentDidMount() {
      if (IsManager && this.props.globalServerSelected !== "") {
        this.populateTornjakServerInfo(this.props.globalServerSelected)
      } else {
        this.populateLocalTornjakServerInfo()
      }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.globalServerSelected !== this.props.globalServerSelected){
      this.populateTornjakServerInfo(this.props.globalServerSelected)
    }
  }

  populateTornjakServerInfo(serverName) {
      axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, {     crossdomain: true })
      .then(response =>{
        console.log(response);
        this.setState({ tornjakServerInfo: response.data["serverinfo"]});
      }).catch(error => {
          this.setState({
              message: "Error retrieving " + serverName + " : "+ error.message,
              agents: [],
          });
      });

  }

  populateLocalTornjakServerInfo() {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        this.setState({ tornjakServerInfo:response.data["serverinfo"]});
      })
      .catch((error) => {
        console.log(error);
      })
  }

  tornjakServerInfo() {
    if (this.state.tornjakServerInfo === "") {
        return ""
    } else {
        return <TornjakServerInfoDisplay tornjakServerInfo={this.state.tornjakServerInfo} />
    }
  }

  render() {

    return (
      <div>
        <h3>Server Info</h3>
        <div className="alert-primary" role="alert">
        <pre>
           {this.state.message}
        </pre>
        </div>
        {IsManager}
        <br/><br/>
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.filteredData.globalServerSelected,
})

export default connect(
  mapStateToProps,
  { serverSelected }
)(TornjakServerInfo)