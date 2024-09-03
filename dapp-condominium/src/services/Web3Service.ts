import ABI from './ABI.json';
import { ethers } from "ethers";

const ADAPTER_ADDRESS = `${process.env.REACT_APP_ADAPTER_ADDRESS}`

export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
}

export type Resident = {
    wallet: string;
    isCounselor: boolean
    isManager: boolean
    residence: number
    nextPayment: number
}

export function isManager(): boolean {
    return parseInt(localStorage.getItem("profile") || "0") === Profile.MANAGER
}

export function isResident(): boolean {
    return parseInt(localStorage.getItem("profile") || "0") === Profile.RESIDENT
}

function getProfile(): Profile {
    const profile = localStorage.getItem("profile") || "0"
    return parseInt(profile)
}

function getProvider(): ethers.BrowserProvider {
    if (!window.ethereum) throw new Error("No MetaMask found")
    return new ethers.BrowserProvider(window.ethereum);
}

function getContract(provider?: ethers.BrowserProvider): ethers.Contract {
    if (!provider) provider = getProvider()
    return new ethers.Contract(ADAPTER_ADDRESS, ABI as ethers.InterfaceAbi, provider)
}

async function getContractSigner(provider?: ethers.BrowserProvider): Promise<ethers.Contract> {
    if (!provider) provider = getProvider()
    const signer = await provider.getSigner(localStorage.getItem("account") || undefined)
    const contract = new ethers.Contract(ADAPTER_ADDRESS, ABI as ethers.InterfaceAbi, provider)
    return contract.connect(signer) as ethers.Contract
}

export type LoginResult = {
    account: string
    profile: Profile
}

export async function doLogin(): Promise<LoginResult> {
    const provider = getProvider()

    const accounts = await provider.send("eth_requestAccounts", [])

    if (!accounts || !accounts.length) throw new Error("Wallet not found/allowed")

    const contract = getContract(provider)

    const resident = (await contract.getResident(accounts[0])) as Resident;
    let isManager = resident.isManager

    if (!isManager && resident.residence > 0) {
        if (resident.isCounselor) {
            localStorage.setItem("profile", `${Profile.COUNSELOR}`)
        } else {
            localStorage.setItem("profile", `${Profile.RESIDENT}`)
        }
    } else if (!isManager && !resident.residence) {
        const manager = await contract.getManager() as string
        isManager = accounts[0].toUpperCase() === manager.toUpperCase();
    }

    if (isManager) {
        localStorage.setItem("profile", `${Profile.MANAGER}`)
    } else if (localStorage.getItem("profile") === null) {
        throw new Error("Unauthorized")
    }

    localStorage.setItem("account", accounts[0])

    return {
        account: accounts[0],
        profile: parseInt(localStorage.getItem("profile") || "0")
    } as LoginResult
}

export function doLogout() {
    localStorage.removeItem("account")
    localStorage.removeItem("profile")
}

export async function getAddress(): Promise<string> {
    const contract = getContract()
    return contract.getImplAddress() as unknown as string
}

export type ResidentPage = {
    residents: Resident[]
    total: ethers.BigNumberish
}

export async function getResidents(page: number = 1, pageSize: number = 10): Promise<ResidentPage> {
    const contract = getContract()
    const result = await contract.getResidents(page, pageSize) as ResidentPage
    const residents = result.residents.filter(r => r.residence).sort((a, b) => {
        if (a.residence > b.residence) return 1
        return -1
    })
    return {
        residents,
        total: result.total
    } as ResidentPage
}

export async function getResident(wallet: string): Promise<Resident> {
    const contract = getContract()
    return await contract.getResident(wallet) as Resident
}

export async function upgrade(address: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error(`You do not have permission.`);
    const contract = await getContractSigner();
    return contract.upgrade(address) as Promise<ethers.Transaction>;
}

export async function addResident(wallet: string, residenceId: number): Promise<ethers.Transaction> {
    if (getProfile() === Profile.RESIDENT) throw new Error(`You do not have permission.`);
    const contract = await getContractSigner();
    return contract.addResident(wallet, residenceId) as Promise<ethers.Transaction>;
}

export async function removeResident(wallet: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error(`You do not have permission.`);
    const contract = await getContractSigner();
    return contract.removeResident(wallet) as Promise<ethers.Transaction>;
}

export async function setCounselor(wallet: string, isEntering: boolean): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error(`You do not have permission.`);
    const contract = await getContractSigner();
    return contract.setCounselor(wallet, isEntering) as Promise<ethers.Transaction>;
}