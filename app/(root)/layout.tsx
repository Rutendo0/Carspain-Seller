interface SetupLayoutProp {
    children: React.ReactNode
}

const SetupLayout = ({children}: SetupLayoutProp) => {
    return (
        <>
            {children}
        </>
    )
}

export default SetupLayout;