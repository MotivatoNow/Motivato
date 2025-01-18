import logo from '../../assets/images/Icon.png'
export const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center ">
        <img src={logo}/>
      <div
        class="w-12 h-12 rounded-full animate-spin
                    border-y border-solid border-[#4F80E2] border-t-transparent"
      ></div>
    </div>
  );
};
