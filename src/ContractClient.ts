import Web3 from 'web3';
import * as TruffleContract from 'truffle-contract';
import { provider } from 'web3-providers/types';
declare const window: Window & { ethereum: any; web3: Web3 };

export class ContractClient {
  private static _instance: ContractClient;
  private web3!: Web3;
  private account!: string;
  private provider!: provider;
  private isReady = false;
  private todoListContract: any;

  private constructor() {
    const loader = async () => {
      await this.loadWeb3();
      await this.loadAccount();
      await this.loadContract();
      this.isReady = true;
    };
    loader();
  }

  static getInstance() {
    if (!ContractClient._instance) {
      ContractClient._instance = new ContractClient();
    }
    return ContractClient._instance;
  }

  async getAccount() {
    await this.waitUntilReady();
    return this.account;
  }

  async getNetworkType() {
    await this.waitUntilReady();
    return this.web3.eth.net.getNetworkType();
  }

  async getTaskCount() {
    await this.waitUntilReady();
    return this.todoListContract.taskCount();
  }

  async getTask(index: number) {
    await this.waitUntilReady();
    return this.todoListContract.tasks(index);
  }

  async createTask(content: string) {
    await this.waitUntilReady();
    return this.todoListContract.createTask(content, { from: this.account });
  }

  async toggleCompleted(id: number) {
    await this.waitUntilReady();
    return this.todoListContract.toggleCompleted(id, { from: this.account });
  }

  private async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      this.provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {}
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      this.provider = window.web3.currentProvider;
    }
    // Non-dapp browsers...
    else {
      this.provider = new Web3.providers.HttpProvider('http://localhost:7545'); // Ganache
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    this.web3 = new Web3(this.provider);
  }

  private async loadAccount() {
    // Set the current blockchain account
    const accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];
    console.log('account:', this.account);
  }

  private async loadContract() {
    // Create a JavaScript version of the smart contract
    const TodoList = TruffleContract(await fetch('/contracts/TodoList.json').then(res => res.json()));
    TodoList.setProvider(this.provider);
    this.todoListContract = await TodoList.deployed();
  }

  private async waitUntilReady() {
    while (!this.isReady) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
