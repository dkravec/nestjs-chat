type Group = {
  id: number; // groupId
  users: string[]; // userEmail
  currentIndexId: number; // indexId
  previousIndexId: number; // indexId
  timestamp: number; // timestamp group created
};

export default Group;
