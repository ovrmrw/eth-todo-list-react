import React, { Component } from 'react';
import { GlobalProps } from '.';

interface Props extends GlobalProps {}

interface State {
  network: string;
  account: string;
  taskCount: number;
  tasks: any[];
}

class App extends Component<Props, Partial<State>> {
  constructor(props: Props) {
    super(props);
    this.state = { tasks: [] };
  }

  componentWillMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const account = await this.props.cc.getAccount();
    const network = await this.props.cc.getNetworkType();
    this.setState({ network, account });
    await this.getTasks();
  }

  getTasks() {
    this.props.cc
      .getTaskCount()
      .then(result => {
        console.log('result:', result);
        this.setState({ taskCount: result.toNumber() });
        return this.state.taskCount!;
      })
      .then(async taskCount => {
        this.setState({ tasks: [] });
        for (let i = 1; i <= taskCount; i++) {
          await this.getTask(i);
        }
      });
  }

  getTask(index: number) {
    this.props.cc.getTask(index).then(result => {
      console.log('result:', result);
      const { id, content, completed } = result;
      const task = { id: id.toNumber(), content, completed };
      const _tasks = this.state.tasks!;
      _tasks[task.id] = task;
      this.setState({ tasks: _tasks });
    });
  }

  createTask(content: string) {
    if (window.confirm('Are you sure to create a new TODO ?')) {
      this.props.cc
        .createTask(content)
        .then(result => {
          console.log('result:', result);
          return this.getTasks();
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  toggleCompleted(task: any) {
    if (window.confirm(`Are you sure to toggle completed of "${task.id}: ${task.content}" ?`)) {
      this.props.cc
        .toggleCompleted(task.id)
        .then(result => {
          console.log('result:', result);
          return this.getTask(task.id);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  render() {
    return (
      <div className="container">
        <h1>ETH TODO LIST</h1>
        <p>Your account: {this.state.account}</p>
        <p>Your network: {this.state.network}</p>
        <button onClick={() => this.getTasks()}>GET TODOS</button>
        <ul>
          {this.state
            .tasks!.filter(task => !task.completed)
            .map(task => (
              <li key={task.id} onClick={() => this.toggleCompleted(task)}>
                {JSON.stringify(task)}
              </li>
            ))}
        </ul>
        <button onClick={() => this.createTask('' + Date.now())}>CREATE TODO</button>
      </div>
    );
  }
}

export default App;
