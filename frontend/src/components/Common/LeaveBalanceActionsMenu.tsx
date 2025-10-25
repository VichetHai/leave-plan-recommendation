import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import DeleteLeaveBalance from "../LeaveBalance/DeleteLeaveBalance"
import EditLeaveBalance from "../LeaveBalance/EditLeaveBalance"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

interface LeaveBalancePublic {
    id: string
    year: string
    balance: number
    leave_type_id: string
    owner_id: string
}

interface LeaveBalanceActionsMenuProps {
    leaveBalance: LeaveBalancePublic
    disabled?: boolean
}

export const LeaveBalanceActionsMenu = ({
    leaveBalance,
    disabled,
}: LeaveBalanceActionsMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit" disabled={disabled}>
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                <EditLeaveBalance leaveBalance={leaveBalance} />
                <DeleteLeaveBalance id={leaveBalance.id} />
            </MenuContent>
        </MenuRoot>
    )
}
