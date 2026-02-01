// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StrategyNFT
 * @notice 策略 NFT 合约 - 代表可验证的 AI 交易策略
 * @dev 仅 Arena 合约可铸造
 */
contract StrategyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct StrategyMetadata {
        string name;
        string description;
        string codeUrl;
        uint256 createdAt;
    }

    mapping(uint256 => StrategyMetadata) public strategyMetadata;

    address public minter;

    event StrategyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name
    );

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call");
        _;
    }

    constructor() ERC721("Verifiable AI Strategy", "VAIS") Ownable(msg.sender) {}

    /**
     * @notice 设置铸造者（Arena 合约地址）
     */
    function setMinter(address _minter) external onlyOwner {
        address oldMinter = minter;
        minter = _minter;
        emit MinterUpdated(oldMinter, _minter);
    }

    /**
     * @notice 铸造策略 NFT（仅 minter 可调用）
     */
    function mintStrategy(
        address to,
        string calldata name,
        string calldata description,
        string calldata codeUrl
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);

        strategyMetadata[tokenId] = StrategyMetadata({
            name: name,
            description: description,
            codeUrl: codeUrl,
            createdAt: block.timestamp
        });

        _setTokenURI(tokenId, codeUrl);

        emit StrategyMinted(tokenId, to, name);

        return tokenId;
    }

    function getStrategyMetadata(uint256 tokenId)
        external
        view
        returns (StrategyMetadata memory)
    {
        ownerOf(tokenId); // reverts if token does not exist
        return strategyMetadata[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
