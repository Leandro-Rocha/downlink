import 'mocha'
import { expect } from 'chai'
import { getNumber } from '../src/common/utils'

describe('Utils',
    () => {

        it('can get the correct number part from strings', getNumberPartTest)
    })

function getNumberPartTest() {

    expect(getNumber()).to.be.undefined
    expect(getNumber('')).to.be.undefined
    expect(getNumber('123')).to.be.equal(123)
    expect(getNumber('123px')).to.be.equal(123)
    expect(getNumber('px123px')).to.be.equal(123)
    expect(getNumber('px123PX')).to.be.equal(123)
    expect(getNumber('PX123PX')).to.be.equal(123)
    expect(getNumber('PXpx')).to.be.undefined
    expect(getNumber('PX!123px')).to.be.equal(123)
    expect(getNumber('PX\\!123px')).to.be.equal(123)
    expect(getNumber('!!##%&¨%$')).to.be.undefined
}
