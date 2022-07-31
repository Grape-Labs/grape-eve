import STATIC_LOGO from '../../public/grape_white_logo.svg';

export const TX_RPC_ENDPOINT = process.env.REACT_APP_API_TX_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
//export const GRAPE_RPC_ENDPOINT = process.env.REACT_APP_API_GRAPE_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
export const GRAPE_RPC_ENDPOINT = process.env.REACT_APP_API_GRAPE_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
export const THEINDEX_RPC_ENDPOINT = process.env.REACT_APP_API_THEINDEX_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
export const SOFLARE_NOTIFICATIONS_API_KEY = process.env.REACT_APP_API_KEY_SOLFLARE_NOTIFICATIONS || '';
export const PROXY = process.env.REACT_APP_API_PROXY || '';
export const ME_KEYBASE = process.env.REACT_APP_API_ME_KEYBASE || null;
export const CROSSMINT_API = process.env.REACT_APP_API_ME_KEYBASE || null;
export const TWITTER_BEARER = process.env.REACT_APP_API_TWITTER_BEARER || null;
export const TWITTER_PROXY = process.env.REACT_APP_API_TWITTER_PROXY || null;

//export const GRAPE_DRIVE = '/';
export const GRAPE_DRIVE = '/?storage=';
export const GRAPE_TREASURY = 'GrapevviL94JZRiZwn2LjpWtmDacXU8QhAJvzpUMMFdL';
export const MARKET_LOGO = STATIC_LOGO;