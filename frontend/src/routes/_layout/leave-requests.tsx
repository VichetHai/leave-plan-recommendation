import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import AddLeaveRequest from "@/components/LeaveRequest/AddLeaveRequest"
import { LeaveRequestActionsMenu } from "@/components/Common/LeaveRequestActionsMenu"
import PendingLeaveRequests from "@/components/Pending/PendingLeaveRequests"
import LeaveTypesService from "@/client/LeaveTypesService"
import { useUsers } from "@/hooks/useUsers"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"
import { OpenAPI } from "@/client/core/OpenAPI"

interface LeaveRequestPublic {
    id: string
    start_date: string
    end_date: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string | null
    requested_at: string
    submitted_at: string | null
    approval_at: string | null
    status: string
}

interface LeaveRequestsResponse {
    data: LeaveRequestPublic[]
    count: number
}

// Temporary service - will be replaced by auto-generated LeaveRequestsService
const LeaveRequestsService = {
    readLeaveRequests: async ({
        skip,
        limit,
    }: {
        skip?: number
        limit?: number
    }): Promise<LeaveRequestsResponse> => {
        const params = new URLSearchParams()
        if (skip !== undefined) params.append("skip", skip.toString())
        if (limit !== undefined) params.append("limit", limit.toString())

        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/leave-requests?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch leave requests")
        }
        return response.json()
    },
}

const leaveRequestsSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 5

function getLeaveRequestsQueryOptions({ page }: { page: number }) {
    return {
        queryFn: () =>
            LeaveRequestsService.readLeaveRequests({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
            }),
        queryKey: ["leave-requests", { page }],
    }
}

export const Route = createFileRoute("/_layout/leave-requests")({
    component: LeaveRequests,
    validateSearch: (search) => leaveRequestsSearchSchema.parse(search),
})

function LeaveRequestsTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeaveRequestsQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

    // Fetch leave types and users for name mapping
    const [leaveTypes, setLeaveTypes] = useState<import("@/client/LeaveTypesService").LeaveTypePublic[]>([])
    useEffect(() => {
        LeaveTypesService.readLeaveTypes({ limit: 100 }).then((res) => setLeaveTypes(res.data))
    }, [])
    const { data: users = [] } = useUsers()

    const setPage = (page: number) => {
        navigate({ to: "/leave-requests", search: (prev) => ({ ...prev, page }) })
    }

    const requests = data?.data.slice(0, PER_PAGE) ?? []
    const count = data?.count ?? 0

    // Map ids to names
    const leaveTypeMap = Object.fromEntries(leaveTypes.map((lt) => [lt.id, lt.name]))
    const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

    if (isLoading) {
        return <PendingLeaveRequests />
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "green"
            case "submitted":
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
                        <Table.ColumnHeader w="sm">Start</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">End</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Requested At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {requests?.map((req) => (
                        <Table.Row key={req.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell truncate maxW="md">{req.description}</Table.Cell>
                            <Table.Cell truncate maxW="sm">{userMap[req.owner_id] || req.owner_id}</Table.Cell>
                            <Table.Cell truncate maxW="sm">{leaveTypeMap[req.leave_type_id] || req.leave_type_id}</Table.Cell>
                            <Table.Cell>{new Date(req.start_date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>{new Date(req.end_date).toLocaleDateString()}</Table.Cell>
                            <Table.Cell>
                                <Badge colorPalette={getStatusColor(req.status)}>
                                    {req.status}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                {req.requested_at
                                    ? new Date(req.requested_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <LeaveRequestActionsMenu leaveRequest={req} />
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

function LeaveRequests() {
    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Requests Management
            </Heading>
            <AddLeaveRequest />
            <LeaveRequestsTable />
        </Container>
    )
}
