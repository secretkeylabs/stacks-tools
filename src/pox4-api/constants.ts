export type Network = "mainnet" | "testnet";
export type ContractPrincipal = { address: string; name: string };

const netValueMap: Record<
  Network,
  {
    pox4ContractAddress: string;
    pox4ContractName: string;
  }
> = {
  mainnet: {
    pox4ContractAddress: "SP000000000000000000002Q6VF78",
    pox4ContractName: "pox-4",
  },
  testnet: {
    pox4ContractAddress: "ST000000000000000000002AMW42H",
    pox4ContractName: "pox-4",
  },
};

export function networkDependentValues(network: Network) {
  return netValueMap[network];
}
