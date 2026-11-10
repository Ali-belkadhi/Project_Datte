/** ABI minimale utilisée par Next.js. Les artifacts Hardhat restent la source de génération. */
export const DATE_TRACEABILITY_ABI = [
  "function LOT_CREATOR_ROLE() view returns (bytes32)",
  "function STEP_ADDER_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function lotExists(string lotId) view returns (bool)",
  "function createLot(string lotId, address producer, string region, string variety, uint256 harvestDate)",
  "function getLot(string lotId) view returns (tuple(string lotId,address producer,string region,string variety,uint256 harvestDate,bool exists))",
  "function addTraceabilityStep(string lotId, uint8 stepType, uint256 date, string location, address responsibleActor, string documentHash)",
  "function getTraceabilityHistory(string lotId) view returns (tuple(uint8 stepType,uint256 date,string location,address responsibleActor,string documentHash)[])",
  "event LotCreated(string indexed lotId, address indexed producer, string region, string variety, uint256 harvestDate)",
  "event TraceabilityStepAdded(string indexed lotId, uint8 stepType, uint256 date, string location, address indexed responsibleActor, string documentHash)",
] as const;
