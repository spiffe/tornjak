import axios from "axios"
import TornjakApi from "../tornjak-api-helpers"

jest.mock("axios")

describe("TornjakApi.clusterDelete", () => {
  const clusters = [{ name: "alpha" }, { name: "beta" }]

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("resolves to the server response and removes the cluster from the list", async () => {
    axios.post.mockResolvedValue({ data: "SUCCESS" })
    const clustersListUpdateFunc = jest.fn()
    const api = new TornjakApi({})

    const result = await api.clusterDelete("server-a", { cluster: { name: "alpha" } }, clustersListUpdateFunc, clusters)

    expect(result).toBe("SUCCESS")
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/manager-api/tornjak/clusters/delete/server-a"),
      { cluster: { name: "alpha" } },
      { crossdomain: true },
    )
    expect(clustersListUpdateFunc).toHaveBeenCalledWith([{ name: "beta" }])
  })

  it("resolves to the error message when the request fails", async () => {
    axios.post.mockRejectedValue(new Error("Request failed with status code 500"))
    const clustersListUpdateFunc = jest.fn()
    const api = new TornjakApi({})

    const result = await api.clusterDelete("server-a", { cluster: { name: "alpha" } }, clustersListUpdateFunc, clusters)

    expect(result).toBe("Request failed with status code 500")
    expect(clustersListUpdateFunc).not.toHaveBeenCalled()
  })
})
