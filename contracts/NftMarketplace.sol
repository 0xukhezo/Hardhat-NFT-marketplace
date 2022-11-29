// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__ItemAlreadyListened(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwners();
error NftMarketplace__NotListed(address _nftAddress, uint256 _tokenId);
error NftMarketplace__PriceNotMet(address _nftAddress, uint256 _tokenId, uint256 itemPrice);

contract NftMarketplace is ReentrancyGuard{ 
    struct Listing {
        uint256 price;
        address seller;
    }

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // Modifiers

    modifier notListed(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__ItemAlreadyListened(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isListed(
        address _nftAddress,
        uint256 _tokenId, 
    ) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _spender
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);
        if (_spender != owner) {
            revert NftMarketplace__NotOwners();
        }
        _;
    }

    // Main functions

    /*
     * @notice Method for listing your NFT on the marketplace
     * @param _nftAddress: Address of the NFT
     * @param _tokenId: ID of the NFT
     * @param _price: Sale price of the NFT
     * @dev Tecnically, we could have the contract be the escrow for the NFTs
     * but this way people can still hold their NFTs when listed.
     */
    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        notListed(_nftAddress, _tokenId, msg.sender)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(_nftAddress);
        if (nft.getApproved(_tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        s_listings[_nftAddress][_tokenId] = Listing(_price, msg.sender);
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    function buyItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        payable nonReentrant isListed(_nftAddress, _tokenId) {
             Listing memory listing = s_listings[_nftAddress][_tokenId];
             if(msg.value < listing.price ){
                revert NftMarketplace__PriceNotMet(_nftAddress, _tokenId, listing.price )
             }
             s_proceeds[listing.seller] = s_proceeds[listing.seller] + msg.value;
             delete(s_listings[_nftAddress][_tokenId]);
             IERC721(_nftAddress).safeTransferFrom(listing.seller, msg.sender, _tokenId)
             emit ItemBought(msg.sender, _nftAddress, _tokenId, listing.price)
        }
}
