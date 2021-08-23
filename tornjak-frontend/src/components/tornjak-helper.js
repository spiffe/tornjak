import { Component } from 'react';
import SpiffeHelper from './spiffe-helper';

class TornjakHelper extends Component {
  constructor(props) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper();
    this.state = {
    };
  }
  
  // detailsLink takes in selectedRows/ specified data and entity
  // returns a specfic routing link/ URL for an entity
  detailsLink(selectedRows, entity,) {
    const dashboardDetailsLink = "/tornjak/dashboard/details/";
    if (selectedRows.length !== 0) {
      var detailsLink = dashboardDetailsLink + entity.toLowerCase() + "/" + encodeURIComponent(selectedRows.id); //encode URL since spiffeid contains special characters
    }
    return detailsLink;
  }

  // detailsDataParse takes in url parameters for a specific url and properties of a class
  // returns a parsed and filtered data for the specifed entity from the url parameteres 
  detailsDataParse(urlParams, props) {
    let selectedData = [{}], id = decodeURIComponent(urlParams.id);
    const { globalClustersList, globalAgentsList, globalEntriesList, globalAgentsWorkLoadAttestorInfo } = props;
    if (urlParams.entity === "clusters") {
      for (let i = 0; i < globalClustersList.length; i++) {
        if (globalClustersList[i].name === id) {
          selectedData = this.SpiffeHelper.cluster(globalClustersList[i], globalEntriesList)
        }
      }
    } else if (urlParams.entity === "agents") {
      for (let i = 0; i < globalAgentsList.length; i++) {
        let agentId = "spiffe://" + globalAgentsList[i].id.trust_domain + globalAgentsList[i].id.path;
        if (agentId === id) {
          let agentEntriesDict = this.SpiffeHelper.getAgentsEntries(globalAgentsList, globalEntriesList)
          selectedData = this.SpiffeHelper.getChildEntries(globalAgentsList[i], agentEntriesDict, globalEntriesList, globalAgentsWorkLoadAttestorInfo)
        }
      }
    } else if (urlParams.entity === "entries") {
      for (let i = 0; i < globalEntriesList.length; i++) {
        if (globalEntriesList[i].id === id) {
          selectedData = this.SpiffeHelper.workloadEntry(globalEntriesList[i], globalAgentsWorkLoadAttestorInfo)
        }
      }
    }
    return selectedData;
  }

}

export default TornjakHelper;