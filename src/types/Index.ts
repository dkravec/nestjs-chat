type Index = {
  id: number; // indexId
  messageIds: number[]; // messageId
  groupId: number;
  nextIndex?: number; // indexId
  previousIndex?: number; // indexId
  timestamp: number; // timestamp created
};

export default Index;
