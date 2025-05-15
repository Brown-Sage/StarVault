export default function Navbar() {
    return (
        <nav className="flex font-bold h-15 justify-evenly bg-red-300 ">
            <div className="flex items-center w-60 flex-column p-2">
                <div>logo</div>
                <div>picture</div>
            </div>
            <ul className=" w-1/3 text-xl h-full flex flex-column items-center justify-center gap-20 p-2">
                <li>Movies</li>
                <li>Anime</li>
                <li>Books</li>
            </ul>
            <div className="flex w-25 items-center flex-column p-2">
                Search 
            </div>
            <div className="flex items-center w-30 flex-column p-2">
                Sign in
            </div>
        </nav>
    )
}