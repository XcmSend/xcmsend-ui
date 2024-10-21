import React, { useState, useContext } from 'react';
import { WalletContext } from 'wallet/src/contexts';
import '../../../../index.css';
import '../../node.styles.scss';
import './AccountDropdown.scss';
import { WalletAccount } from 'wallet/src/connect-wallet/src/types';
import { listChains } from 'chains-lib';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';
import { isEthereumAddress } from '@polkadot/util-crypto';



function AccountDropdown({ selectedChainName, onSelect, selectedAddress }: { 
  selectedChainName: string, 
  onSelect: (address: string) => void,
  selectedAddress: string | null
}) {
  const walletContext = useContext(WalletContext);
  const chains = listChains(); 
  // console.log(  "AccountDropdown chains:", chains);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(selectedAddress);

  // console.log("WalletContext:", walletContext);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAccAddress = event.target.value;
    const matchedAccount = walletContext.accounts.find(acc => acc.address === selectedAccAddress);
    setSelectedAccount(matchedAccount ? matchedAccount.address : null);

    // This is where you inform the parent component about the selected account/address change
    if (matchedAccount) {
        onSelect(matchedAccount.address);
    }
    
    // console.log("Selected:", matchedAccount);
    // console.log("Selected Address:", selectedAccount);
};

  const displayAddress = (address: string, prefix: number) => {
  //    console.log(`display address: `, address);
  //    console.log(`display prefix: `, prefix);
    var encodedAddress = address;
    if (!isEthereumAddress(address)) { // if address is not an evm address, we want to substrate encode it
      encodedAddress = encodeAddress(decodeAddress(address), prefix);
    }
    const start = encodedAddress.slice(0, 6); 
    const end = encodedAddress.slice(-4); 
    return `${start}...${end}`;
  };

  const getPrefixForAddress = (address: string) => {
    // Using the passed chain name to fetch the correct prefix
    const chainInfo = Object.values(chains).find(chain => chain.name === selectedChainName);

    return chainInfo ? chainInfo.prefix : 42; // Default to 42 if not found
  };

  return (
    <div className="select-container">
      <select 
        value={selectedAccount || ""}
        onChange={handleChange}
        className='border border-gray-300 p-2 rounded-md w-full font-semibold'
      >
        <option className="" value="">Select Address</option>
        {walletContext.accounts.map(acc => (
          <option className="" key={acc.address} value={acc.address}>
            {`${acc.name} (${displayAddress(acc.address, getPrefixForAddress(acc.address))})`}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AccountDropdown;



