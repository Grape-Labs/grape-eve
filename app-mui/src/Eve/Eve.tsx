import React, { useEffect, useCallback, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
//import { ShdwDrive } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
import { Schema, deserializeUnchecked, deserialize } from "borsh";
import { TokenAmount } from '../utils/grapeTools/safe-math';
import { GrapeEve, IDL } from '../../types/grape_eve';
import tidl from '../../idl/grape_eve.json';

import LitJsSdk from "lit-js-sdk";

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
//import { GrapeEve, IDL } from "../../../target/types/grape_eve"
import dayjs from "dayjs"
var relativeTime = require('dayjs/plugin/relativeTime')

import { Thread } from '../models'

import { 
    Provider, Program, web3 
} from '@project-serum/anchor'

import { useSnackbar } from 'notistack';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletConnectButton } from "@solana/wallet-adapter-material-ui";

import { useTranslation } from 'react-i18next';

import moment from 'moment';

import { 
    GRAPE_RPC_ENDPOINT
} from '../utils/grapeTools/constants';

import { styled } from '@mui/material/styles';
import {
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemAvatar,
    ListItemButton,
    Avatar,
    Tooltip,
    Typography,
    Collapse,
    ListSubheader,
    Button,
    ButtonGroup,
    CircularProgress,
    Divider,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    FormControlLabel,
    FormLabel,
    Select,
    MenuItem,
    InputLabel,
    Paper,
    Switch,
    Container,
    Radio,
    RadioGroup,
    LinearProgress
} from '@mui/material';

import GrapeIcon from "../components/static/GrapeIcon";
import SolanaIcon from "../components/static/SolIcon";
import SolCurrencyIcon from '../components/static/SolCurrencyIcon';

import { buffer } from "node:stream/consumers";

const Input = styled('input')({
    display: 'none',
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));

function isImage(url:string) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

let workspace = null

export const useWorkspace = () => workspace
  
export function EveView(props: any){
	//const geconnection = new Connection(GRAPE_RPC_ENDPOINT);
    const geconnection = new Connection("https://api.devnet.solana.com");
    //const { connection } = useConnection();

    //const client = new LitJsSdk.LitNodeClient();
	const wallet = useWallet();
    const {publicKey} = useWallet();
    const [loading, setLoading] = React.useState(false);

    const {handlekey} = useParams<{ handlekey: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlParams = searchParams.get("storage") || searchParams.get("address") || handlekey;
    const [threads, setThreads] = React.useState(null);
    
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error);
        },
        [enqueueSnackbar]
    );

    function created_at (date:number) {
        return moment.unix(date).format('lll');
    }

    function created_ago (blockTime:number) {
        try{
            let prettydate = moment.unix(+blockTime).format("MMMM Do YYYY, h:mm a");
                        //console.log("prettyForSaleDate: "+prettyForSaleDate)
            let timeago = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asDays().toFixed(0);
            //console.log("Time Ago: "+timeago);
            if (+timeago >= 1){
                if (+timeago === 1)
                    prettydate = timeago+' day ago';
                else
                    prettydate = timeago+' days ago';
            } else{
                let hoursago = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asHours().toFixed(0);
                if (+hoursago >= 1){
                    if (+hoursago === 1)
                        prettydate = hoursago+' hour ago';
                    else
                        prettydate = hoursago+' hours ago';
                } else {
                    let minutesAgo = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asMinutes().toFixed(0);
                    if (+minutesAgo >= 1){
                        if (+minutesAgo === 1)
                            prettydate = minutesAgo+' minute ago';
                        else
                            prettydate = minutesAgo+' minutes ago';
                    } else {
                        let secondsAgo = moment.duration(moment(new Date()).diff(moment.unix(+blockTime))).asSeconds().toFixed(0);
                        if (+secondsAgo >= 1){
                            if (+secondsAgo === 1)
                                prettydate = secondsAgo+' second ago';
                            else
                                prettydate = secondsAgo+' seconds ago';
                        }
                    }
                }
            }  
    
            return prettydate;
        }catch(e){
            return blockTime;
        }
    }

    //export const  initWorkspace = () => {
    async function initWorkspace() {  
        const clusterUrl = 'https://api.devnet.solana.com'; //'https://ssc-dao.genesysgo.net/';//process.env.VUE_APP_CLUSTER_URL
        const grapeEveId = "GXaZPJ3kwoZKMMxBxnRnwG87EJKBu7GjT8ks8dR4p693";
        const programID = new PublicKey(grapeEveId);
        
        const connection = new Connection(clusterUrl)

        async function getProvider() {
            /* create the provider and return it to the caller */
            /* network set to local network for now */
            const connection = new Connection(clusterUrl);
            
            //const provider = new AnchorProvider(
            const provider = new Provider(
                    connection, wallet, {
                commitment: "processed"
            },
            );
            return provider;
        }

        const provider = await getProvider()
        const program = new Program<GrapeEve>(IDL, programID, provider);
        //const program = new Program(tidl, programID, provider);
        
        workspace = {
            wallet,
            connection,
            provider,
            program,
        }
    }

    const fetchThreads = async (filters = []) => {
        await initWorkspace();
        const { program } = await useWorkspace()

        const thread = await program.account.thread.all(filters);

        //console.log("t: "+JSON.stringify(thread));
        //return thread;
        const mptrd = thread.map((thread:any) => new Thread(thread.publicKey, thread.account))
        mptrd.sort((a:any,b:any) => (a.timestamp < b.timestamp) ? 1 : -1);
        setThreads(mptrd);
                
        return mptrd;
    }

    const newPost = async (topic:string, discussion:string, community:string, encrypted:number) => {
        await initWorkspace();
        const { wallet, provider, program } = useWorkspace()
        
        const thread = web3.Keypair.generate()
        
        console.log("pk: "+publicKey.toBase58());
        
        enqueueSnackbar(`Preparing to create a new post`,{ variant: 'info' });
        
        const signedTransaction = await program.rpc.sendPost(topic, discussion, {
            accounts: {
                author: publicKey,
                thread: thread.publicKey,
                systemProgram: web3.SystemProgram.programId,
            },
            signers: [thread]
        })
    
        //console.log("signature: "+JSON.stringify(signedTransaction));

        const snackprogress = (key:any) => (
            <CircularProgress sx={{padding:'10px'}} />
        );
        const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
        const latestBlockHash = await geconnection.getLatestBlockhash();
        await geconnection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signedTransaction}, 
            'finalized'
        );
        closeSnackbar(cnfrmkey);

        const snackaction = (key:any) => (
            <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                {signedTransaction}
            </Button>
        );
        enqueueSnackbar(`Post created`,{ variant: 'success', action:snackaction });
        

        // do a refresh this is not efficient we should simply 
        // do a dynamic push/popup on the object and avoid the additional rpc call
        fetchThreads();
    }

    const editPost = async (filters = []) => {
        
    }

    function EditPost(props:any){
        const thread = props.thread;

        return (

            <Button>
                    Edit
            </Button>
        )
    }
    
    function DeletePost(props:any){
        const thread = props.thread;
        
        const deletePost = async () => {
            await initWorkspace();
            const { wallet, provider, program } = useWorkspace()
    
            console.log("deleting: "+thread.toBase58() + " from: "+publicKey.toBase58());

            enqueueSnackbar(`Preparing to delete post`,{ variant: 'info' });
            const signedTransaction = await program.rpc.deletePost({
                accounts: {
                    author: publicKey,
                    thread: thread,
                },
            })

            const snackprogress = (key:any) => (
                <CircularProgress sx={{padding:'10px'}} />
            );
            const cnfrmkey = enqueueSnackbar(`Confirming...`,{ variant: 'info', action:snackprogress, persist: true });
            const latestBlockHash = await geconnection.getLatestBlockhash();
            await geconnection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signedTransaction}, 
                'finalized'
            );
            closeSnackbar(cnfrmkey);
    
            const snackaction = (key:any) => (
                <Button href={`https://explorer.solana.com/tx/${signedTransaction}`} target='_blank'  sx={{color:'white'}}>
                    {signedTransaction}
                </Button>
            );
            enqueueSnackbar(`Post created`,{ variant: 'success', action:snackaction });
        
            console.log("signature: "+JSON.stringify(signedTransaction));
            // do a refresh this is not efficient we should simply 
            // do a dynamic push/popup on the object and avoid the additional rpc call
            fetchThreads();
        }

        return (

            <Button
                onClick={deletePost}
            >
                    Delete
            </Button>
        )
    }
    
    function PostView(props:any){
        const [openPreviewDialog, setOpenPreviewDialog] = React.useState(false);
        const [discussion, setDiscussion] = React.useState(null);
        const [topic, setTopic] = React.useState(null);
        const [community, setCommunity] = React.useState(null);
        const {publicKey} = useWallet();

        const handleClickOpenPreviewDialog = () => {
            setOpenPreviewDialog(true);
        };
        
        const handleClosePreviewDialog = () => {
            setOpenPreviewDialog(false);
        };

        async function handlePostNow(event: any) {
            event.preventDefault();
            handleClosePreviewDialog();
            
            console.log("posting: "+topic+" - "+discussion);
            
            const thisthread = await newPost(topic, discussion, community, 1);
            console.log("thisThread: "+JSON.stringify(thisthread));
        }

        return (

            <>
                {publicKey &&
                <Button
                    variant="text"
                    //component={Link} to={`${GRAPE_PREVIEW}${item.mint}`}
                    onClick={handleClickOpenPreviewDialog}
                    sx={{borderRadius:'24px'}}
                >
                    Add
                </Button>
                }
                <BootstrapDialog 
                    fullWidth={true}
                    maxWidth={"lg"}
                    open={openPreviewDialog} onClose={handleClosePreviewDialog}
                    PaperProps={{
                        style: {
                            background: '#13151C',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px'
                        }
                    }}
                >
                    <form onSubmit={handlePostNow}>
                        <DialogContent>
                            <FormControl fullWidth>
                            <TextField
                                id="filled-multiline-static"
                                label="Start a discussion"
                                multiline
                                rows={4}
                                onChange={(e: any) => {
                                    setDiscussion(e.target.value)}
                                }
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <TextField 
                                    fullWidth 
                                    label="Topic" 
                                    id="fullWidth" 
                                    onChange={(e: any) => {
                                        setTopic(e.target.value)}
                                    }/>
                            </FormControl>
                            <FormControlLabel control={<Switch defaultChecked />} label="Encrypted" />
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Community</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Community"
                                    onChange={(e: any) => {
                                        setCommunity(e.target.value)}
                                    }
                                >
                                    <MenuItem value={1}>Grape</MenuItem>
                                </Select>
                            </FormControl>
                        
                        </DialogContent>
                        <DialogActions>
                            <Button variant="text" onClick={handleClosePreviewDialog}>Cancel</Button>
                            <Button 
                                type="submit"
                                variant="text" 
                                title="Submit">
                                SUBMIT
                            </Button>
                        </DialogActions>
                    </form>
                </BootstrapDialog>

            </>

        )
    }

    useEffect(() => {
		(async () => {
            //if (urlParams){
                //console.log("PARAMS: "+urlParams);

                setLoading(true);
                await fetchThreads(null);
                //console.log("threads: "+JSON.stringify(thrds))
                setLoading(false);

            /*
            } else if (wallet?.publicKey) {
                setLoading(true);
                // do some magic here...
                setLoading(false);
			}*/

		})();
	}, [])
	
    return (
        <>
            <Box
                sx={{ 
                    p: 1, 
                    mt: 6,
                    mb: 3, 
                    width: '100%',
                    background: '#13151C',
                    borderRadius: '24px'
                }}
            > 
                <Grid 
                    container 
                    direction="column" 
                    spacing={2} 
                    alignItems="center"
                    justifyContent={'center'}
                    rowSpacing={8}
                >
                    
                    <Grid 
                        item sm={12}
                        alignItems="center"
                    >

                        {loading ?
                            <Box sx={{ width: '100%' }}>
                                Loading...
                                <LinearProgress />
                            </Box>
                        :
                            <>
                                {threads &&
                                    <>
                                        <Typography>
                                            {threads.length} thread posts
                                            <PostView />
                                        </Typography>
                                        <List sx={{ width: '100%' }}>
                                        
                                        {console.log("t: "+JSON.stringify(threads))}
                                        
                                        {threads.map((item:any, key:number) => {
                                            return (
                                                <ListItem alignItems="flex-start" key={key}>
                                                    <ListItemAvatar>
                                                        <Avatar>
                                                            <Jazzicon diameter={40} seed={jsNumberForAddress(item?.author.toBase58())} />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <>
                                                                <Typography>
                                                                    {item?.content}
                                                                </Typography>
                                                            </>
                                                            }
                                                        secondary={
                                                            <React.Fragment>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                {created_ago(+item?.timestamp)}
                                                            </Typography>
                                                            &nbsp;-&nbsp;{item?.author.toBase58()}
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Topic: {item?.topic}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Community: {item?.community.toBase58()} - Type: {item?.communityType}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Metadata: {item?.metadata}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                                    Encrypted: {item?.isEncrypted}
                                                                </Typography>
                                                                {publicKey && publicKey.toBase58() === item?.author.toBase58() &&
                                                                    <>
                                                                        <EditPost thread={item.publicKey}/>
                                                                        <DeletePost thread={item.publicKey}/>
                                                                    </>
                                                                }
                                                            </React.Fragment>
                                                        }
                                                    />
                                                </ListItem>
                                            )
                                        })}
                                        </List>
                                    </>
                                }
                            </>
                        }
                    </Grid>
                </Grid>
            </Box>
        </>
	)
}