import { useState } from 'react';
import GroupCard from '../components/GroupCard';
import Modal from '../components/Modal';
import './Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([
    { id: 1, name: 'Trip to Vegas', members: ['You', 'Friend1', 'Friend2'] },
    { id: 2, name: 'Apartment', members: ['You', 'Roommate'] },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', members: '' });

  const handleAddGroup = (e) => {
    e.preventDefault();
    const membersArray = newGroup.members.split(',').map(m => m.trim());
    setGroups([...groups, { id: groups.length + 1, name: newGroup.name, members: membersArray }]);
    setShowModal(false);
    setNewGroup({ name: '', members: '' });
  };

  return (
    <div className="groups">
      <h2>Groups</h2>
      <button className="add-button" onClick={() => setShowModal(true)}>Add Group</button>
      <div className="groups-list">
        {groups.map(group => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Add New Group</h3>
        <form onSubmit={handleAddGroup}>
          <input
            type="text"
            placeholder="Group Name"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Members (comma separated)"
            value={newGroup.members}
            onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value })}
            required
          />
          <button type="submit">Create Group</button>
        </form>
      </Modal>
    </div>
  );
};

export default Groups;
