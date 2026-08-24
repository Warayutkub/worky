const btn_array = [
    {
        btn : document.getElementById('btn-to-history'),
        to : "history"
    },
    {
        btn : document.getElementById('btn-to-timeSave'),
        to : "timeSave"
    },
    {
        btn : document.getElementById('btn-to-home'),
        to : ""
    },
    
    
]

document.body.insertAdjacentHTML('afterbegin', `
    <div class="bg-[#1e90ff] w-full text-white shadow-md p-4 flex justify-center">
        <h1 class="font-bold text-2xl text-white">Worky</h1>
    </div>
`);

btn_array.forEach(({btn,to})=>{
    if(!btn) return

    const currentPath = window.location.pathname

    btn.addEventListener('click',()=>{
        window.location.href = new URL(to, window.location.href).href;
    })
    
    if (currentPath === to || currentPath === `${to}/` || (to !== '/' && currentPath.startsWith(to))) {
        btn.classList.add(
            '-translate-y-4',
            'transition-all',
            'duration-300',
            'ease-out'
        );
    }
})

