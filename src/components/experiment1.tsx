import React, { useState } from 'react';
import axios from 'axios';

export default function ZkPassApp() {
  // Setup
  const [taskIdA, setTaskIdA] = useState('');
  const [zkpassAddr, setZkpassAddr] = useState('');
  const [policyIdA, setPolicyIdA] = useState('');
  const [setupTxRef, setSetupTxRef] = useState('');
  const [sendStatusA, setSendStatusA] = useState('');

  // 👇 Type for the selected wallet
  const selectedWallet: string = "lace"; // or "eternl", "lace", etc.

  const handleSetup = async () => {
    try {
      const api: WalletApi = await window.cardano[selectedWallet].enable();

      const body = {
	ipUsedAddrs: await api.getUsedAddresses(),
        ipChangeAddr: await api.getChangeAddress(),
        ipTaskId: Number(taskIdA),
	ipZkpassAddr: zkpassAddr
      };

      console.log(body);
      
      const response = await axios.post('http://localhost:8080/setup', body);

      console.log(response.data)

      console.log("Will try to sign & submit...")  //DEBUG

//      console.log(response.data.srUnsigned.urspTxBodyHex)  //DEBUG

      const signedTx = await api.signTx(response.data.srUnsigned.urspTxBodyHex, true);

      const submitData = await axios.post<{
        submitTxFee: number;
        submitTxId: string;
      }>(
        "http://localhost:8080/add-wit-and-submit",
        {
          awasTxUnsigned: response.data.srUnsigned.urspTxBodyHex,
          awasTxWit: signedTx,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(submitData.data);

      setSendStatusA('✅ Reference scripts successfully sent.');
      setPolicyIdA('PolicyId: ' + response.data.srParams.sysPolicyId);
      setPolicyIdB(response.data.srParams.sysPolicyId);
      setSetupTxRef('Transaction ID: ' + submitData.data.submitTxId);
      setScriptRefC(submitData.data.submitTxId);
      setScriptRefD(submitData.data.submitTxId);
    } catch (err) {
      console.error('Error sending task:', err);
      setSendStatusA('❌ Failed to send task or write to file.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <section>
        <h2>Setup zkPass</h2>
        <div className="input-row">
          <input
            type="text"
            placeholder="Task ID (arbitrary integer)"
            value={taskIdA}
            onChange={(e) => setTaskIdA(e.target.value)}
	    onBlur={() => {
	      setTaskIdB(taskIdA);
	      setTaskIdD(taskIdA);
	    }}
            style={{ width: '60%' }}
          />
	  <span>Task ID</span>
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
        {sendStatusA && <p style={{ marginTop: '1rem', color: sendStatusA.startsWith('✅') ? 'green' : 'red' }}>{sendStatusA}</p>}
	{sendStatusA.startsWith('✅') ? (
	  <>
	    <p>{policyIdA}</p>
	    <p>{setupTxRef}</p>
	  </>
	) : null}
      </section>

    </div>
  );
}
