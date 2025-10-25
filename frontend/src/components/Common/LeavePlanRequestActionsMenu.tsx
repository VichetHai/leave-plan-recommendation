import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import DeleteLeavePlanRequest from "../LeavePlanRequest/DeleteLeavePlanRequest"
import EditLeavePlanRequest from "../LeavePlanRequest/EditLeavePlanRequest"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

interface LeavePlanRequestPublic {
    id: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string
    requested_at: string
    approved_at: string | null
    status: string
    amount: number
    details: any[]
}

interface LeavePlanRequestActionsMenuProps {
    leavePlanRequest: LeavePlanRequestPublic
    disabled?: boolean
}

export const LeavePlanRequestActionsMenu = ({
    leavePlanRequest,
    disabled,
}: LeavePlanRequestActionsMenuProps) => {
    return (
        <MenuRoot>
            <MenuTrigger asChild>
                <IconButton variant="ghost" color="inherit" disabled={disabled}>
                    <BsThreeDotsVertical />
                </IconButton>
            </MenuTrigger>
            <MenuContent>
                <EditLeavePlanRequest leavePlanRequest={leavePlanRequest} />
                <DeleteLeavePlanRequest id={leavePlanRequest.id} />
            </MenuContent>
        </MenuRoot>
    )
}
