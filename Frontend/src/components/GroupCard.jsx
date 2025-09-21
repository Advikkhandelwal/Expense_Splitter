import './GroupCard.css';

const GroupCard = ({ group }) => {
  return (
    <div className="group-card">
      <h3>{group.name}</h3>
      <p>Members: {group.members.join(', ')}</p>
    </div>
  );
};

export default GroupCard;
