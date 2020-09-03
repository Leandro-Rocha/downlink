import { expect } from "chai"
import 'mocha'
import { ResourceManager } from "../src/resource-manager"
import Resource, { ResourceTypes } from "../src/resource"


describe('File Transfer',
    () => {
        it('can allocate single download', singleDownload)
    })

const rm = ResourceManager
function singleDownload() {

    const A = new Resource(ResourceTypes.NETWORK, 'A1', 1, 2)
    const B = new Resource(ResourceTypes.NETWORK, 'A2', 1, 3)
    const X = new Resource(ResourceTypes.NETWORK, 'X', 2)

    ResourceManager.linkResources(A, X)
    ResourceManager.linkResources(B, X)
    ResourceManager.processReallocationList()
    
    console.log(rm.resourceMatrix.allocationMatrix)
}