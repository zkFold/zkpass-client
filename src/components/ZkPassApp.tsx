import React, { useState } from 'react';
import axios from 'axios';

export default function ZkPassApp() {
  // Wallet
  const [selectedWallet, setSelectedWallet] = useState<string>("lace");
  // Setup
  const [fmTag, setFMTag] = useState('');
  const [zkpassAddr, setZkpassAddr] = useState('');
  const [policyIdA, setPolicyIdA] = useState('');
  const [setupTxRef, setSetupTxRef] = useState('');
  const [sendStatusA, setSendStatusA] = useState('');
  // Transfer
  const [policyIdB, setPolicyIdB] = useState('');
  const [reward, setReward] = useState('');
  const [rewardTxRef, setRewardTxRef] = useState('');
  const [sendStatusB, setSendStatusB] = useState('');
  // Mint
  const [mintBenefAddr, setMintBenefAddr] = useState('');
  const [zkPassResult, setZkPassResult] = useState('');
  const [zkpPolicyId, setZkpPolicyId] = useState('');
  const [zkpTknName, setZkpTknName] = useState('');
  const [mintTxRef, setMintTxRef] = useState('');
  const [sendStatusC, setSendStatusC] = useState('');
  // Burn
  const [zkPassTokenD, setZkPassTokenD] = useState('');
  const [burnTxRef, setBurnTxRef] = useState('');
  const [sendStatusD, setSendStatusD] = useState('');

  const handleSetup = async () => {
    try {
      console.log('Selected wallet:', selectedWallet)
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	ipUsedAddrs: await api.getUsedAddresses(),
        ipChangeAddr: await api.getChangeAddress(),
        ipFMTag: Number(fmTag),
	ipZkpassAddr: zkpassAddr
      };

      console.log(body);
      
      const response = await axios.post('http://localhost:8080/setup', body);

      console.log(response.data);

      if (response.data.srOut) {
	const srOut    = response.data.srOut
	const signedTx = await api.signTx(srOut.soUnsigned.urspTxBodyHex, true);

	const submitData = await axios.post<{
	  submitTxFee: number;
	  submitTxId: string;
	}>(
	  "http://localhost:8080/add-wit-and-submit",
	  {
	    awasTxUnsigned: srOut.soUnsigned.urspTxBodyHex,
	    awasTxWit: signedTx,
	  },
	  {
	    headers: {
	      "Content-Type": "application/json",
	    },
	  }
	);

	console.log(submitData.data);

	const saveRef = await axios.post<{ srSaved: boolean }>(
	  "http://localhost:8080/save-ref",
	  { sriTxId: submitData.data.submitTxId },
	  {
	    headers: {
	      "Content-Type": "application/json",
	    },
	  }
	);

	console.log("SavedRef:", saveRef.data.srSaved);

	setSendStatusA('✅ Reference scripts successfully sent.');
	setPolicyIdA('PolicyId: ' + srOut.soPolicyId);
	setPolicyIdB(srOut.soPolicyId);
	setSetupTxRef('Transaction ID: ' + submitData.data.submitTxId);
      } else {
	console.log("No setup necessary.");
	setSendStatusA('No setup necessary (using previous setup).');
      }
    } catch (err) {
      console.error('Error sending task:', err);
      setSendStatusA('❌ Failed to send task or write to file.');
    }
  };

  const handleReward = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	tiUsedAddrs: await api.getUsedAddresses(),
	tiChangeAddr: await api.getChangeAddress(),
	tiPolicyId: policyIdB,
	tiReward: Number(reward)
      };

      console.log(body);

      const response = await axios.post('http://localhost:8080/transfer', body);

      console.log(response.data)

      const signedTx = await api.signTx(response.data.urspTxBodyHex, true);

      const submitData = await axios.post<{
        submitTxFee: number;
        submitTxId: string;
      }>(
        "http://localhost:8080/add-wit-and-submit",
        {
          awasTxUnsigned: response.data.urspTxBodyHex,
          awasTxWit: signedTx,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(submitData.data);

      setSendStatusB('✅ Reward forwarded successfully.');
      setRewardTxRef('Transaction ID: ' + submitData.data.submitTxId);
    } catch (err) {
      console.error('Error forwarding reward:', err);
      setSendStatusB('❌ Failed to forward reward.');
    }
  };

  const handleMint = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	miUsedAddrs: await api.getUsedAddresses(),
	miChangeAddr: await api.getChangeAddress(),
	miBeneficiaryAddr: mintBenefAddr
      };

      console.log(body);

      const response = await axios.post('http://localhost:8080/mint', body);

      console.log(response.data);

      const signedTx = await api.signTx(response.data.zkprUnsigned.urspTxBodyHex, true);

      const submitData = await axios.post<{
        submitTxFee: number;
        submitTxId: string;
      }>(
        "http://localhost:8080/add-wit-and-submit",
        {
          awasTxUnsigned: response.data.zkprUnsigned.urspTxBodyHex,
          awasTxWit: signedTx,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(submitData.data);

      setSendStatusC('✅ Minted successfully; token sent.');
      setZkPassResult(response.data.zkprResult)
      setZkpPolicyId(response.data.zkprPolicyId);
      setZkpTknName(response.data.zkprTknName);
      setZkPassTokenD(response.data.zkprPolicyId + '.' + response.data.zkprTknName);
      setMintTxRef('Transaction ID: ' + submitData.data.submitTxId);
    } catch (err) {
      console.error('Minting error:', err);
      setSendStatusC('❌ Failed to mint zkPass token.');
    }
  };

  const handleBurn = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	biUsedAddrs: await api.getUsedAddresses(),
	biChangeAddr: await api.getChangeAddress(),
	biZkPassToken: zkPassTokenD
      };

      console.log(body);

      const response = await axios.post('http://localhost:8080/burn', body);

      console.log(response.data)

      const signedTx = await api.signTx(response.data.urspTxBodyHex, true);

      const submitData = await axios.post<{
        submitTxFee: number;
        submitTxId: string;
      }>(
        "http://localhost:8080/add-wit-and-submit",
        {
          awasTxUnsigned: response.data.urspTxBodyHex,
          awasTxWit: signedTx,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      console.log(submitData.data);

      setSendStatusD('✅ Successfully burned token and claimed reward.');
      setBurnTxRef('Transaction ID: ' + submitData.data.submitTxId);
    } catch (err) {
      console.error('Burning error:', err);
      setSendStatusD('❌ Failed to burn zkPass token.');
    }
  };

  const setOwnAddr = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	oaUsedAddrs: await api.getUsedAddresses()
      };

      console.log(body);

      const response = await axios.post('http://localhost:8080/own-addr', body);

      console.log(response.data);

      setMintBenefAddr(response.data.oaOwnAddress);
    } catch (err) {
      console.log('can not set to own address');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div className="wallet-selector">
	<label className="wallet-option">
          <input
            type="radio"
            name="wallet"
            value="lace"
            checked={selectedWallet === "lace"}
            onChange={(e) => setSelectedWallet(e.target.value)}
          />
          Lace
	</label>

	<label className="wallet-option">
          <input
            type="radio"
            name="wallet"
            value="eternl"
            checked={selectedWallet === "eternl"}
            onChange={(e) => setSelectedWallet(e.target.value)}
          />
          Eternl
	</label>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Setup zkPass</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="ForwardingMint Tag (arbitrary integer)"
            value={fmTag}
            onChange={(e) => setFMTag(e.target.value)}
            style={{ width: '60%' }}
          />
	  <span>ForwardingMint Tag</span>
        </div>
        <div className="input-row">
          <input
            type="text"
            placeholder="zkPass-main address"
            value={zkpassAddr}
            onChange={(e) => setZkpassAddr(e.target.value)}
            style={{ width: '60%' }}
          />
          <button onClick={handleSetup} style={{ marginLeft: '0rem' }}>Setup</button>
        </div>
        {sendStatusA && <p style={{ marginTop: '1rem',
				    color: sendStatusA.startsWith('✅') ? 'green' :
				    sendStatusA.startsWith('❌') ? 'red' : 'black'
				  }}>{sendStatusA}</p>}
	{sendStatusA.startsWith('✅') ? (
	  <>
	    <p>{policyIdA}</p>
	    <p>{setupTxRef}</p>
	  </>
	) : null}
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
        <h2>Transfer zkPass Reward</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Policy ID"
            value={policyIdB}
            onChange={(e) => setPolicyIdB(e.target.value)}
            style={{ width: '60%' }}
          />
	  <span>Policy ID</span>
        </div>
        <div className="input-row">
          <input
            type="text"
            placeholder="Reward (lovelaces &ge; 2000000)"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            style={{ width: '60%' }}
          />
        <button onClick={handleReward} style={{ marginLeft: '0rem' }}>Forward reward</button>
        </div>
        {sendStatusB && <p style={{ marginTop: '1rem', color: sendStatusB.startsWith('✅') ? 'green' : 'red' }}>{sendStatusB}</p>}
	{sendStatusB.startsWith('✅') ? <p>{rewardTxRef}</p> : null}
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
	<h2>Mint zkPass Token</h2>
	<div className="input-row">
	  <input
	    type="text"
	    placeholder="zkPass token recipient (address)"
	    value={mintBenefAddr}
	    onChange={(e) => setMintBenefAddr(e.target.value)}
	    style={{ width: '60%' }}
	  />
	  <span>zkPass recipient</span>
	  <button onClick={setOwnAddr} style={{ marginLeft: '1rem', backgroundColor: 'gray' }}>Self</button>
	</div>
        <button onClick={handleMint} style={{ marginLeft: '11.3rem' }}>Mint zkPass</button>
	{zkPassResult && <p style={{ marginTop: '1rem' }}><b>zkPassResult: {zkPassResult}</b></p>}
        {sendStatusC && <p style={{ marginTop: '1rem', color: sendStatusC.startsWith('✅') ? 'green' : 'red' }}>{sendStatusC}</p>}
	{mintTxRef && <p>{mintTxRef}</p>}
	{sendStatusC.startsWith('✅') ? (
	  <>
	    <p>zkPass Token:</p>
	    <p style={{ marginTop: '-0.5rem', marginLeft: '1rem'}}>policyId: {zkpPolicyId}</p>
	    <p style={{ marginTop: '-0.5rem', marginLeft: '1rem'}}>token name: {zkpTknName}</p>
	  </>
	) : null}
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section>
	<h2>Burn zkPass Token & get reward</h2>
	<div className="input-row">
	  <input
	    type="text"
	    placeholder="zkPass Token"
	    value={zkPassTokenD}
	    onChange={(e) => setZkPassTokenD(e.target.value)}
	    style={{ width: '60%' }}
	  />
	  <span>Token</span>
	</div>
        <button onClick={handleBurn} style={{ marginLeft: '10rem' }}>Burn zkPass token</button>	
        {sendStatusD && <p style={{ marginTop: '1rem', color: sendStatusD.startsWith('✅') ? 'green' : 'red' }}>{sendStatusD}</p>}
	{burnTxRef && <p>{burnTxRef}</p>}
      </section>
    </div>
  );
}
