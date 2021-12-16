import React, {
  Component
} from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import brain from '../brain.png'
const CARD_ARRAY = [{
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'ice-cream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  }
]
class App extends Component {

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-ethereum broser detected. You should cosider trying MetaMask')
    }
  }

  async loadBlockChainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({
      account: accounts[0]
    })

    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if (networkData) {
      const address = networkData.address
      const abi = MemoryToken.abi
      const tokenContract = new web3.eth.Contract(abi, address);
      const totalSupply = await tokenContract.methods.totalSupply().call()
      console.log('totalSupply', totalSupply.toString())
      // owner can see all tokens
      let balanceOf = await tokenContract.methods.balanceOf(accounts[0]).call()
      console.log('balanceOf', balanceOf.toString())
      let tokenURIs = []
      for (let i = 0; i < balanceOf; i++) {
        let id = await tokenContract.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await tokenContract.methods.tokenURI(id).call()
        tokenURIs.push(tokenURI)
      }
      console.log(tokenURIs)
      this.setState({
        tokenContract,
        totalSupply,
        tokenURIs
      })
    } else {
      alert('Smart contract not deployed to detected network')
    }
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockChainData()
    this.setState({
      cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random())
    })
  }

  chooseImage(cardId) {
    cardId = cardId.toString()
    if (this.state.cardsChosenId.includes(cardId)) {
      return CARD_ARRAY[cardId].img
    } else if (this.state.cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png'
    } else {
      return window.location.origin + '/images/blank.png'
    }
  }

  async flipCard(cardId) {
    let alreadyChosen = this.state.cardsChosen.length
    this.setState({
      cardsChosen: [ ...this.state.cardsChosen, this.state.cardArray[cardId].name ],
      cardsChosenId: [ ...this.state.cardsChosenId, cardId ]
    })
    if (alreadyChosen === 1) {
      setTimeout(() => { this.checkForMatch() }, 100)
    }
  }

  checkForMatch() {
    let choosenIdOne = this.state.cardsChosenId[0]
    let choosenIdTwo = this.state.cardsChosenId[1]
    if (choosenIdOne === choosenIdTwo) {
      alert('您点击了相同的卡片')
    } else if ( this.state.cardsChosen[0] === this.state.cardsChosen[1] ) {
      alert('成功配对！')
      this.state.tokenContract.methods.mint(
        this.state.account,
        window.location.origin + CARD_ARRAY[choosenIdOne].img.toString()
      ).send({
        from: this.state.account
      }).on('transactionHash', (hash) => {
        this.setState({
          cardsWon: [...this.state.cardsWon, choosenIdOne, choosenIdTwo],
          tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[choosenIdOne].img ]
        })
      })
    } else {
      alert('匹配失败，请重新选择')
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: []
    })
    if (this.state.cardsWon.length === CARD_ARRAY.length) {
      alert('恭喜你，通关了！')
    }
  }


  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      tokenContract: {},
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: []
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
          <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; Memory Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">开始连连看!</h1>

                <div className="grid mb-4" >

                  { this.state.cardArray.map((card, key) => {
                    return(
                      <img
                        key={key}
                        src={this.chooseImage(key)}
                        data-id={key}
                        alt="no img"
                        onClick={(event) => {
                          let cardId = event.target.getAttribute('data-id')
                          if(!this.state.cardsWon.includes(cardId.toString())) {
                            this.flipCard(cardId)
                          }
                        }}
                      />
                    )
                  })}


                </div>

                <div>

                  <h5>已获得的NFT奖励:<span id="result">&nbsp;{this.state.tokenURIs.length}</span></h5>

                  <div className="grid mb-4" >

                    { this.state.tokenURIs.map((tokenURI, key) => {
                      return(
                        <img
                          alt="no img"
                          key={key}
                          src={tokenURI}
                        />
                      )
                    })}

                  </div>

                </div>

              </div>

            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;