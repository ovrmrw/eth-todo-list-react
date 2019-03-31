pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    bool completed;
  }

  mapping (uint => Task) public tasks;

  event TaskCreated(uint id, string content, bool completed);

  event ToggleCompleted(uint id, bool completed);

  constructor() public {
    createTask("My first todo.");
  }

  function createTask(string memory _content) public {
    taskCount++;
    Task memory task = Task(taskCount, _content, false);
    tasks[taskCount] = task;
    emit TaskCreated(task.id, task.content, task.completed);
  }

  function toggleCompleted(uint _id) public {
    Task memory task = tasks[_id];
    task.completed = !task.completed;
    tasks[_id] = task;
    emit ToggleCompleted(task.id, task.completed);
  }
}
