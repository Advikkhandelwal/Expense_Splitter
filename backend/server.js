const express = require('express');
const app = express();
app.use(express.json());
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  console.log("New User:", name, email);
  res.send("User created successfully");
});
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  console.log("Fetching user with ID:", userId);
  res.send(`User data for ID: ${userId}`);
});
app.post('/groups', (req, res) => {
    const { groupName } = req.body;
    console.log("New Group:", groupName);
    res.send("Group created successfully");
});
app.post('/groups/:id/members', (req, res) => {
  const groupId = req.params.id;
  const { memberName } = req.body;
  console.log(`Adding member ${memberName} to group ID: ${groupId}`);
  res.send(`Member ${memberName} added to group ID: ${groupId}`);
});
app.post('/expenses', (req, res) => {
    const{groupId,paidBy,amount,description}=req.body;
    console.log("Expense:",groupId,paidBy,amount,description);
    res.send("Expense recorded successfully");
});
app.get('/groups/:id/balance', (req, res) => {
  const groupId = req.params.id;
  console.log("Calculating balance for group ID:", groupId);
  res.send(`Balance details for group ID: ${groupId}`);
});
app.post('/settlements', (req, res) => {
    const { fromUser, toUser, amount } = req.body;
  console.log(`Settlement: ${fromUser} paid ${amount} to ${toUser}`);
  res.send("Settlement recorded successfully");
});
app.listen(3000, () => {
  console.log('server started at port no. 3000');
});
