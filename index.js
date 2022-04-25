const { Console } = require('console');

Web3 = require('web3');
solc = require('solc');

fs = require('fs');

web3AndSolc();

async function web3AndSolc() {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

    let accounts = await web3.eth.getAccounts();

    console.log("Accounts: ", accounts);

    let balance = await web3.eth.getBalance(accounts[0]);

    console.log("Balance of 0th Account: ", web3.utils.fromWei(balance, 'ether'));

    CONTRACT_FILE = 'SimpleStore.sol'
    content = fs.readFileSync(CONTRACT_FILE).toString()

    input = {
        language: 'Solidity',
        sources: {
            [CONTRACT_FILE]: {
                content: content
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }

    compiled = solc.compile(JSON.stringify(input));
    output = JSON.parse(compiled);

    abi = output.contracts['SimpleStore.sol'].SimpleStorage.abi;
    bytecode = output.contracts['SimpleStore.sol'].SimpleStorage.evm.bytecode.object;
    myContract = new web3.eth.Contract(abi);


    let deployedInstance = await myContract.deploy({ data: '0x' + bytecode }).send({ from: accounts[0],  gas: 1000000 });
    contractAddress = deployedInstance.options.address;
    myContract.options.address = contractAddress;

    console.log("Contract deployed at: " + contractAddress);

    let setValueTx = await myContract.methods.set(12).send({from:accounts[0] });

    console.log("Tranasction ID: ", setValueTx.transactionHash)

    let getValue = await myContract.methods.get().call();

    console.log("Returned Value: ", getValue);
}