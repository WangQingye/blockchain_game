// const { assert } = require('chai')

const { assert } = require('chai')

const MemoryToken = artifacts.require('./MemoryToken.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Memory Token', (accounts) => {
  let token

  before(async () => {
    token = await MemoryToken.deployed()
  })

  describe('deployment', async () => {

    it('deploys successfully', async () => {
      const address = token.address
      assert.notEqual(address, 0x0)
    })

    it('has a name', async () => {
      const name = await token.name()
      assert.equal(name, "Memory Token")
    })

    it('has a symbol', async () => {
      const symbol = await token.symbol()
      assert.equal(symbol, "MEMORY")
    })

    it('token distribution', async () => {
      let result
    })

  })

  describe('token distribution', async () => {

    let result
    it('mint tokens', async () => {
      await token.mint(accounts[0], 'https://www.token-uri.com/nft')

      // it should increse the total apply
      result = await token.totalSupply()
      assert.equal(result.toString(), '1', "total supply is correct")

      // owner balance is incresed
      result = await token.balanceOf(accounts[0])
      assert.equal(result.toString(), '1', "balanceOf supply is correct")

      // owner of index 1 is correct
      result = await token.ownerOf('1')
      assert.equal(result.toString(), accounts[0].toString(), "ownerOf is correct")

      // owner can see all tokens
      let balanceOf = await token.balanceOf(accounts[0])
      let tokenIds = []
      for (let i = 0; i < balanceOf.length; i++) {
        let id = await token.tokenOfOwnerByIndex(accounts[0], i);
        tokenIds.push(id.toString())        
      }
      assert.equal(tokenIds.toString(), ['1'].toString(), "tokenIds are correct")

      // token uri correct
      let tokenURI = await token.tokenURI('1')
      assert.equal(tokenURI, 'https://www.token-uri.com/nft', "tokenURL is correct")
    })

  })
})
