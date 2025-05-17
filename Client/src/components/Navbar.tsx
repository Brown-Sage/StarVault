import SearchIcon from '@mui/icons-material/Search'
export default function Navbar() {
    return (
        <nav className="flex font-bold text-blue-300 h-15 justify-around bg-black ">
            <div className="flex items-center w-60 flex-column p-2">
                <div className='text-fuchsia-500 text-3xl' >StarVault</div>
                {/* <div>picture</div> */}
            </div>
            <ul className=" w-1/3 text-xl h-full flex flex-column items-center justify-center gap-20 p-2">
                <li>Movies</li>
                <li>Anime</li>
                <li>Books</li>
            </ul>
            <div className="flex  items-center flex-column p-2">
                <input className='p-2 bg-blue-500 h-9 text-amber-50 placeholder-amber-50 outline-0 rounded-2xl' type="text" placeholder='Search' />
                {/* <SearchIcon/> */}
            </div>
            <div className="flex items-center">
                <button className='flex rounded-xl bg-emerald-700 text-white justify-center items-center p-2 w-22 h-9 flex-column'>Sign Up</button>
            </div>
        </nav> 
    )
}