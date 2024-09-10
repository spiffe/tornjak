import {env} from '../env';

const API_VERSION = env.REACT_APP_API_VERSION;
const API_BASE_URL = `/api/${API_VERSION}`;
const apiEndpoints = {
    spireServerInfoApi: `${API_BASE_URL}/spire/serverinfo`,
    spireHealthCheckApi: `${API_BASE_URL}/spire/healthcheck`,
    spireAgentsApi: `${API_BASE_URL}/spire/agents`,
    spireAgentsBanApi: `${API_BASE_URL}/spire/agents/ban`,
    spireJoinTokenApi: `${API_BASE_URL}/spire/agents/jointoken`,
    spireEntriesApi: `${API_BASE_URL}/spire/entries`,
    tornjakServerInfoApi: `${API_BASE_URL}/tornjak/serverinfo`,
    tornjakSelectorsApi: `${API_BASE_URL}/tornjak/selectors`,
    tornjakAgentsApi: `${API_BASE_URL}/tornjak/agents`,
    tornjakClustersApi: `${API_BASE_URL}/tornjak/clusters`,
};

export default apiEndpoints;
