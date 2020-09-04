// import { expect } from "chai"
// import 'mocha'
// import Resource, { ResourceTypes } from "../src/resource"
// import { ResourceManager, ResourceMatrix } from "../src/resource-manager"


// describe('ResourceManager',
//     () => {
//         beforeEach(() => {
//             ResourceManager.resourceMatrix = new ResourceMatrix()
//         });

//         it('consecutive additions and removals', addRemoveTest)
//         it('multiple additions and removals', multipleAddsAndRemovals)
//     })



// function multipleAddsAndRemovals() {
//     const A = new Resource(ResourceTypes.NETWORK, 'A', 1)
//     const B = new Resource(ResourceTypes.NETWORK, 'B', 0.5)
//     const C = new Resource(ResourceTypes.NETWORK, 'C', 2)
//     const X = new Resource(ResourceTypes.NETWORK, 'X', 1)
//     const Y = new Resource(ResourceTypes.NETWORK, 'Y', 1)
//     const Z = new Resource(ResourceTypes.NETWORK, 'Z', 1)

//     ResourceManager.linkResources(A, X)
//     ResourceManager.linkResources(B, X)
//     ResourceManager.linkResources(B, Y)
//     ResourceManager.linkResources(A, Y)
//     ResourceManager.unlinkResources(A, Y)
//     ResourceManager.linkResources(A, Y)
//     ResourceManager.linkResources(A, Z)
//     ResourceManager.linkResources(C, Y)
//     ResourceManager.linkResources(C, Z)

//     expect(Object.keys(ResourceManager.resourceMatrix.allocationMatrix)).has.lengthOf(0)
//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     ResourceManager.processReallocationList()

//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Z), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(C, Y), 'Wrong allocation on matrix').to.be.approximately(0.416, 0.001)


//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(C.allocated, 'Wrong allocation on resource').to.be.approximately(0.4166 + 0.6666, 0.001)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.250, 0.001)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Z.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.666, 0.001)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)
// }


// function addRemoveTest() {
//     const A = new Resource(ResourceTypes.NETWORK, 'A', 1)
//     const B = new Resource(ResourceTypes.NETWORK, 'B', 0.5)
//     const C = new Resource(ResourceTypes.NETWORK, 'C', 2)
//     const X = new Resource(ResourceTypes.NETWORK, 'X', 1)
//     const Y = new Resource(ResourceTypes.NETWORK, 'Y', 1)
//     const Z = new Resource(ResourceTypes.NETWORK, 'Z', 1)

//     // ===================================================================================================
//     ResourceManager.linkResources(A, X)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.equal(1)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.undefined
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.undefined
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.undefined
//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(0)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================
//     ResourceManager.linkResources(B, X)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.equal(0.5)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.undefined
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.5)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.undefined

//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(0)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================
//     ResourceManager.linkResources(B, Y)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.equal(0.75)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.undefined
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)

//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(0.75)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(0.25)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================
//     ResourceManager.linkResources(A, Y)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.equal(0.5)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.equal(0.5)
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)

//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.equal(0.75)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(0.75)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================
//     ResourceManager.unlinkResources(A, Y)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.equal(0.75)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.undefined
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)

//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(0.75)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(0.25)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================
//     ResourceManager.linkResources(A, Y)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.equal(0.5)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.equal(0.5)
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)

//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.equal(0.75)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(0.75)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================
//     ResourceManager.linkResources(A, Z)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Z), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)

//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.250, 0.001)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.250, 0.001)
//     expect(Z.allocated, 'Wrong allocation on resource').to.be.approximately(0.333, 0.001)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================

//     ResourceManager.linkResources(C, Y)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Z), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(C, Y), 'Wrong allocation on matrix').to.be.approximately(0.416, 0.001)


//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(C.allocated, 'Wrong allocation on resource').to.be.approximately(0.416, 0.001)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.250, 0.001)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Z.allocated, 'Wrong allocation on resource').to.be.approximately(0.333, 0.001)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)

//     // ===================================================================================================

//     ResourceManager.linkResources(C, Z)
//     ResourceManager.processReallocationList()
//     expect(ResourceManager.getAllocationByPair(A, X), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Y), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(A, Z), 'Wrong allocation on matrix').to.be.approximately(0.333, 0.001)
//     expect(ResourceManager.getAllocationByPair(B, X), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(B, Y), 'Wrong allocation on matrix').to.be.equal(0.25)
//     expect(ResourceManager.getAllocationByPair(C, Y), 'Wrong allocation on matrix').to.be.approximately(0.416, 0.001)


//     expect(A.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(B.allocated, 'Wrong allocation on resource').to.be.equal(0.5)
//     expect(C.allocated, 'Wrong allocation on resource').to.be.approximately(0.4166 + 0.6666, 0.001)
//     expect(X.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.250, 0.001)
//     expect(Y.allocated, 'Wrong allocation on resource').to.be.equal(1)
//     expect(Z.allocated, 'Wrong allocation on resource').to.be.approximately(0.333 + 0.666, 0.001)

//     expect(Object.keys(ResourceManager.resourceMatrix.orientedMatrix)).has.lengthOf(0)
// }