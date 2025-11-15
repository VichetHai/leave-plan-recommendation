import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { OpenAPI } from "@/client/core/OpenAPI"
import LeaveTypesService from "@/client/LeaveTypesService"
import { UsersService } from "@/client"
import AddLeavePlanRequest from "@/components/LeavePlanRequest/AddLeavePlanRequest"
import { LeavePlanRequestActionsMenu } from "@/components/Common/LeavePlanRequestActionsMenu"
import PendingLeavePlanRequests from "@/components/Pending/PendingLeavePlanRequests"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"

// This type will be auto-generated once you regenerate the API client
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

interface LeavePlanRequestsResponse {
    data: LeavePlanRequestPublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated LeavePlanRequestsService
const LeavePlanRequestsService = {
    readLeavePlanRequests: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<LeavePlanRequestsResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch leave plan requests")
        }
        return response.json()
    },
}

const leavePlanRequestsSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 5

function getLeavePlanRequestsQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            LeavePlanRequestsService.readLeavePlanRequests({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["leave-plan-requests", { page }],
    }
}

export const Route = createFileRoute("/_layout/leave-plan-requests")({
    component: LeavePlanRequests,
    validateSearch: (search) => leavePlanRequestsSearchSchema.parse(search),
})

function LeavePlanRequestsTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeavePlanRequestsQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    // Fetch users for user names
    const { data: usersData } = useQuery({
        queryKey: ["users"],
        queryFn: () => UsersService.readUsers({ limit: 1000 }),
    })

    // Fetch leave types for leave type names
    const { data: leaveTypesData } = useQuery({
        queryKey: ["leave-types"],
        queryFn: () => LeaveTypesService.readLeaveTypes({ skip: 0, limit: 100 }),
    })

    // Create lookup maps
    const usersMap = new Map(usersData?.data.map(user => [user.id, user.full_name || user.email]) || [])
    const leaveTypesMap = new Map(leaveTypesData?.data.map(lt => [lt.id, lt.name]) || [])

    const setPage = (page: number) => {
        navigate({
            to: "/leave-plan-requests",
            search: (prev) => ({ ...prev, page }),
        })
    }

    const leavePlanRequests = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    if (isLoading) {
        return <PendingLeavePlanRequests />
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "green"
            case "pending":
                return "yellow"
            case "rejected":
                return "red"
            default:
                return "gray"
        }
    }

    return (
        <>
            <Table.Root size={{ base: "sm", md: "md" }}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="md">Description</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">User</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Leave Type</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approver</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Amount</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Requested At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {leavePlanRequests?.map((request) => (
                        <Table.Row key={request.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="md">
                                {request.description}
                            </Table.Cell>
                            <Table.Cell>
                                {usersMap.get(request.owner_id) || "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {leaveTypesMap.get(request.leave_type_id) || "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {request.approver_id ? usersMap.get(request.approver_id) || "-" : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette="blue">{request.amount}</Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={getStatusColor(request.status)}>
                                    {request.status}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                {new Date(request.requested_at).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell>
                                <LeavePlanRequestActionsMenu leavePlanRequest={request} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Flex justifyContent="flex-end" mt={4}>
                <PaginationRoot
                    count={count}
                    pageSize={PER_PAGE}
                    onPageChange={({ page }) => setPage(page)}
                >
                    <Flex>
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </Flex>
                </PaginationRoot>
            </Flex>
        </>
    )
}

function LeavePlanRequests() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Plan Requests Management
            </Heading>

            <AddLeavePlanRequest />
            <LeavePlanRequestsTable />
        </Container>
    )
}
