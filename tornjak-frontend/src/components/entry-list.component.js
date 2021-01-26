import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import GetApiServerUri from './helpers';

const Entry = props => (
  <tr>
    <td>{props.entry.id}</td>
    <td>{ "spiffe://" + props.entry.spiffe_id.trust_domain + props.entry.spiffe_id.path}</td>
    <td>{ "spiffe://" + props.entry.parent_id.trust_domain + props.entry.parent_id.path}</td>
    <td>{ props.entry.selectors.map(s => s.type + ":" + s.value).join(', ')}</td>
    
    <td>
      {/* <Link to={"/entryView/"+props.entry._id}>view</Link>*/}
      <br/>
      <a href="#" onClick={() => { props.deleteEntry (props.entry.id) }}>delete</a>
    </td>

    <td><div style={{overflowX: 'auto', width: "400px"}}>
    <pre>{JSON.stringify(props.entry, null, ' ')}</pre>
    </div></td>

  </tr>
)

export default class EntryList extends Component {
  constructor(props) {
    super(props);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.state = { entries: [] };
  }

  componentDidMount() {
    axios.get(GetApiServerUri('/entry/list'), { crossdomain: true })
      .then(response => {
          console.log(response.data);
        this.setState({ entries:response.data["entries"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }

  deleteEntry(id) {
    axios.post('http://localhost:10000/entry/delete', {
        "ids": [id]
    })
      .then(res => { console.log(res.data)
        this.setState({
          entries: this.state.entries.filter(el => el.id !== id)
        })
      })
  }

  entryList() {
      //return this.state.entries.toString()
    if (typeof this.state.entries !== 'undefined') {
        return this.state.entries.map(currentEntry => {
          return <Entry key={currentEntry.id} 
                    entry={currentEntry} 
                    deleteEntry={this.deleteEntry}/>;
        })
    } else {
        return ""
    }
  }

  render() {
    return (
      <div>
        <h3>Entry List</h3>
        <table className="table" style={{width : "100%"}}>
          <thead className="thead-light">
            <tr>
              <th>ID</th>
              <th>SPIFFE ID</th>
              <th>Parent ID</th>
              <th>Selectors</th>
              <th>Actions</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {this.entryList()}
          </tbody>
        </table>
      </div>
    )
  }
}
