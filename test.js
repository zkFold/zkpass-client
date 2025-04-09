import axios from 'axios';

async function main() {
  try {
    const res = await axios.post('http://localhost:8080/setup', {
      "ipTaskId": 123
    });
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
}

main();
