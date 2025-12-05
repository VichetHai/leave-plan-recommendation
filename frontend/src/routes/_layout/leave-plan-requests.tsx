import { Badge, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { OpenAPI } from "@/client/core/OpenAPI"
import AddLeavePlanRequest from "@/components/LeavePlanRequest/AddLeavePlanRequest"
import { LeavePlanRequestActionsMenu } from "@/components/Common/LeavePlanRequestActionsMenu"
import PendingLeavePlanRequests from "@/components/Pending/PendingLeavePlanRequests"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination.tsx"
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "@/components/ui/dialog"

// Nested user object returned by API
interface UserInfo {
    id: string
    full_name: string
    email: string
}

// Nested leave type object returned by API
interface LeaveTypeInfo {
    id: string
    code: string
    name: string
}

// This type will be auto-generated once you regenerate the API client
interface LeavePlanRequestPublic {
    id: string
    description: string
    leave_type_id: string
    owner_id: string
    approver_id: string | null
    requested_at: string
    submitted_at: string | null
    approved_at: string | null
    status: string
    amount: number
    details: Array<{ leave_date: string }>
    owner: UserInfo
    leave_type: LeaveTypeInfo
    approver: UserInfo | null
}

interface LeavePlanRequestsResponse {
    data: LeavePlanRequestPublic[]
    count: number
}

// Sample data for demonstration purposes
const sampleLeavePlanRequests: LeavePlanRequestPublic[] = [
    {
        id: "a1b2c3d4-5678-90ab-cdef-111111111111",
        description: "Annual family vacation to Japan",
        leave_type_id: "lt-001",
        owner_id: "user-001",
        approver_id: "user-002",
        requested_at: "2025-12-01T09:00:00Z",
        submitted_at: "2025-12-01T09:30:00Z",
        approved_at: "2025-12-02T14:00:00Z",
        status: "approved",
        amount: 4.5,
        details: [
            { leave_date: "2025-12-20" },
            { leave_date: "2025-12-23" },
            { leave_date: "2025-12-24" },
            { leave_date: "2025-12-26" },
            { leave_date: "2025-12-27" },
        ],
        owner: {
            id: "user-001",
            full_name: "John Smith",
            email: "john.smith@example.com",
        },
        leave_type: {
            id: "lt-001",
            code: "AL",
            name: "Annual Leave",
        },
        approver: {
            id: "user-002",
            full_name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
        },
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-222222222222",
        description: "Medical appointment and recovery",
        leave_type_id: "lt-002",
        owner_id: "user-003",
        approver_id: "user-002",
        requested_at: "2025-12-03T10:15:00Z",
        submitted_at: "2025-12-03T10:20:00Z",
        approved_at: null,
        status: "pending",
        amount: 1.5,
        details: [
            { leave_date: "2025-12-10" },
            { leave_date: "2025-12-11" },
        ],
        owner: {
            id: "user-003",
            full_name: "Emily Davis",
            email: "emily.davis@example.com",
        },
        leave_type: {
            id: "lt-002",
            code: "SL",
            name: "Sick Leave",
        },
        approver: {
            id: "user-002",
            full_name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
        },
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-333333333333",
        description: "Personal matters - house moving",
        leave_type_id: "lt-003",
        owner_id: "user-004",
        approver_id: null,
        requested_at: "2025-12-04T08:00:00Z",
        submitted_at: null,
        approved_at: null,
        status: "draft",
        amount: 3,
        details: [
            { leave_date: "2025-12-15" },
            { leave_date: "2025-12-16" },
            { leave_date: "2025-12-17" },
        ],
        owner: {
            id: "user-004",
            full_name: "Michael Chen",
            email: "michael.chen@example.com",
        },
        leave_type: {
            id: "lt-003",
            code: "PL",
            name: "Personal Leave",
        },
        approver: null,
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-444444444444",
        description: "Christmas and New Year holiday",
        leave_type_id: "lt-001",
        owner_id: "user-005",
        approver_id: "user-002",
        requested_at: "2025-11-25T11:00:00Z",
        submitted_at: "2025-11-25T11:30:00Z",
        approved_at: "2025-11-26T09:00:00Z",
        status: "approved",
        amount: 4.5,
        details: [
            { leave_date: "2025-12-29" },
            { leave_date: "2025-12-30" },
            { leave_date: "2025-12-31" },
            { leave_date: "2026-01-02" },
            { leave_date: "2026-01-03" },
        ],
        owner: {
            id: "user-005",
            full_name: "Lisa Anderson",
            email: "lisa.anderson@example.com",
        },
        leave_type: {
            id: "lt-001",
            code: "AL",
            name: "Annual Leave",
        },
        approver: {
            id: "user-002",
            full_name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
        },
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-555555555555",
        description: "Training and professional development",
        leave_type_id: "lt-004",
        owner_id: "user-006",
        approver_id: "user-007",
        requested_at: "2025-12-02T14:00:00Z",
        submitted_at: "2025-12-02T14:15:00Z",
        approved_at: null,
        status: "rejected",
        amount: 2,
        details: [
            { leave_date: "2025-12-18" },
            { leave_date: "2025-12-19" },
        ],
        owner: {
            id: "user-006",
            full_name: "David Wilson",
            email: "david.wilson@example.com",
        },
        leave_type: {
            id: "lt-004",
            code: "TL",
            name: "Training Leave",
        },
        approver: {
            id: "user-007",
            full_name: "Robert Brown",
            email: "robert.brown@example.com",
        },
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-666666666666",
        description: "Paternity leave - expecting baby",
        leave_type_id: "lt-005",
        owner_id: "user-008",
        approver_id: "user-002",
        requested_at: "2025-11-20T09:30:00Z",
        submitted_at: "2025-11-20T10:00:00Z",
        approved_at: "2025-11-21T08:00:00Z",
        status: "approved",
        amount: 10,
        details: [
            { leave_date: "2026-01-06" },
            { leave_date: "2026-01-07" },
            { leave_date: "2026-01-08" },
            { leave_date: "2026-01-09" },
            { leave_date: "2026-01-10" },
            { leave_date: "2026-01-13" },
            { leave_date: "2026-01-14" },
            { leave_date: "2026-01-15" },
            { leave_date: "2026-01-16" },
            { leave_date: "2026-01-17" },
        ],
        owner: {
            id: "user-008",
            full_name: "James Taylor",
            email: "james.taylor@example.com",
        },
        leave_type: {
            id: "lt-005",
            code: "PTL",
            name: "Paternity Leave",
        },
        approver: {
            id: "user-002",
            full_name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
        },
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-777777777777",
        description: "Bereavement - family funeral",
        leave_type_id: "lt-006",
        owner_id: "user-009",
        approver_id: "user-007",
        requested_at: "2025-12-04T16:00:00Z",
        submitted_at: "2025-12-04T16:05:00Z",
        approved_at: "2025-12-04T16:30:00Z",
        status: "approved",
        amount: 2.5,
        details: [
            { leave_date: "2025-12-05" },
            { leave_date: "2025-12-06" },
            { leave_date: "2025-12-08" },
        ],
        owner: {
            id: "user-009",
            full_name: "Jennifer Martinez",
            email: "jennifer.martinez@example.com",
        },
        leave_type: {
            id: "lt-006",
            code: "BL",
            name: "Bereavement Leave",
        },
        approver: {
            id: "user-007",
            full_name: "Robert Brown",
            email: "robert.brown@example.com",
        },
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-888888888888",
        description: "Summer vacation planning",
        leave_type_id: "lt-001",
        owner_id: "user-010",
        approver_id: null,
        requested_at: "2025-12-05T07:00:00Z",
        submitted_at: null,
        approved_at: null,
        status: "draft",
        amount: 7,
        details: [
            { leave_date: "2026-07-01" },
            { leave_date: "2026-07-02" },
            { leave_date: "2026-07-03" },
            { leave_date: "2026-07-06" },
            { leave_date: "2026-07-07" },
            { leave_date: "2026-07-08" },
            { leave_date: "2026-07-09" },
            { leave_date: "2026-07-10" },
        ],
        owner: {
            id: "user-010",
            full_name: "Amanda White",
            email: "amanda.white@example.com",
        },
        leave_type: {
            id: "lt-001",
            code: "AL",
            name: "Annual Leave",
        },
        approver: null,
    },
]

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

        try {
            const response = await fetch(`${baseUrl}/api/v1/leave-plan-requests?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                throw new Error("Failed to fetch leave plan requests")
            }
            const data = await response.json()
            // If API returns empty data, use sample data
            if (data.data.length === 0) {
                const start = skip || 0
                const end = start + (limit || 10)
                return {
                    data: sampleLeavePlanRequests.slice(start, end),
                    count: sampleLeavePlanRequests.length,
                }
            }
            return data
        } catch {
            // Fallback to sample data if API fails
            const start = skip || 0
            const end = start + (limit || 10)
            return {
                data: sampleLeavePlanRequests.slice(start, end),
                count: sampleLeavePlanRequests.length,
            }
        }
    },
}

const leavePlanRequestsSearchSchema = z.object({
    page: z.number().catch(1),
})

const PER_PAGE = 10

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
    const [selectedRequest, setSelectedRequest] = useState<LeavePlanRequestPublic | null>(null)
    const [popupType, setPopupType] = useState<"description" | "owner" | "approver" | null>(null)

    const openPopup = (request: LeavePlanRequestPublic, type: "description" | "owner" | "approver") => {
        setSelectedRequest(request)
        setPopupType(type)
    }

    const closePopup = () => {
        setSelectedRequest(null)
        setPopupType(null)
    }

    const { data, isLoading, isPlaceholderData } = useQuery({
        ...getLeavePlanRequestsQueryOptions({ page }),
        placeholderData: (prevData) => prevData,
    })

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
            case "draft":
                return "gray"
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
                        <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Leave Type</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approver</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Amount</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Status</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Requested At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Submitted At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Approved At</Table.ColumnHeader>
                        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {leavePlanRequests?.map((request) => (
                        <Table.Row key={request.id} opacity={isPlaceholderData ? 0.5 : 1}>
                            <Table.Cell
                                truncate
                                maxW="md"
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => openPopup(request, "description")}
                            >
                                {request.description}
                            </Table.Cell>
                            <Table.Cell
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => openPopup(request, "owner")}
                            >
                                {request.owner?.full_name || request.owner?.email || "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {request.leave_type?.name || "-"}
                            </Table.Cell>
                            <Table.Cell
                                cursor="pointer"
                                _hover={{ textDecoration: "underline", color: "blue.500" }}
                                onClick={() => openPopup(request, "approver")}
                            >
                                {request.approver?.full_name || request.approver?.email || "-"}
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
                                {request.submitted_at
                                    ? new Date(request.submitted_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                {request.approved_at
                                    ? new Date(request.approved_at).toLocaleDateString()
                                    : "-"}
                            </Table.Cell>
                            <Table.Cell>
                                <LeavePlanRequestActionsMenu leavePlanRequest={request} />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Dialog to show details based on clicked column */}
            <DialogRoot
                size="xs"
                placement="center"
                open={selectedRequest !== null}
                onOpenChange={({ open }) => !open && closePopup()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {popupType === "description" && "Leave Plan Request Details"}
                            {popupType === "owner" && "Owner Details"}
                            {popupType === "approver" && "Approver Details"}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody pb={4}>
                        {popupType === "description" && (
                            <>
                                <Text fontWeight="bold" mb={1}>Description:</Text>
                                <Text mb={3}>{selectedRequest?.description || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>ID:</Text>
                                <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedRequest?.id}</Text>
                            </>
                        )}
                        {popupType === "owner" && (
                            <>
                                <Text fontWeight="bold" mb={1}>Name:</Text>
                                <Text mb={3}>{selectedRequest?.owner?.full_name || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Email:</Text>
                                <Text mb={3}>{selectedRequest?.owner?.email || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Owner ID:</Text>
                                <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedRequest?.owner?.id || selectedRequest?.owner_id || "-"}</Text>
                            </>
                        )}
                        {popupType === "approver" && (
                            <>
                                <Text fontWeight="bold" mb={1}>Name:</Text>
                                <Text mb={3}>{selectedRequest?.approver?.full_name || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Email:</Text>
                                <Text mb={3}>{selectedRequest?.approver?.email || "-"}</Text>
                                <Text fontWeight="bold" mb={1}>Approver ID:</Text>
                                <Text fontSize="sm" color="gray.600" wordBreak="break-all">{selectedRequest?.approver?.id || selectedRequest?.approver_id || "-"}</Text>
                            </>
                        )}
                    </DialogBody>
                    <DialogCloseTrigger />
                </DialogContent>
            </DialogRoot>

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
