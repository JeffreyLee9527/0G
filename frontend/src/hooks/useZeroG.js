import { ethers } from 'ethers';

// 0G Storage Explorer (Galileo 测试网) - 策略存证后在此查看
// MVP: 模拟上传，链接指向官方 Storage Explorer  submissions 页
const OG_STORAGE_EXPLORER = 'https://storagescan-galileo.0g.ai/submissions';

export function useZeroG() {
  const uploadToDA = async (data) => {
    try {
      // MVP: 模拟上传 - 使用数据的 keccak256 作为哈希存证
      const payload = JSON.stringify({
        data,
        timestamp: Date.now(),
      });
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payload));

      return {
        url: OG_STORAGE_EXPLORER,
        hash,
        txHash: '0x' + hash.slice(2, 66),
      };
    } catch (err) {
      console.error('0G DA upload failed:', err);
      throw new Error('Failed to upload to 0G DA');
    }
  };

  const computeCodeHash = (code) => {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(code || ''));
  };

  return {
    uploadToDA,
    computeCodeHash,
  };
}
