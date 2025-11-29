import { Badge, Button, Container, Flex, Heading, Input, Table, Text, Tooltip } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { OpenAPI } from "@/client/core/OpenAPI"
import { Skeleton } from "@/components/ui/skeleton"


interface LeaveRecommendation {
    leave_date: string
    bridge_holiday: boolean
    team_workload: number
    preference_score: number
    predicted_score: number
}

interface RecommendationsResponse {
    data: LeaveRecommendation[]
}

// Temporary service - will be replaced by auto-generated RecommendationsService
const RecommendationsService = {
    getRecommendations: async ({ year }: { year: number }): Promise<RecommendationsResponse> => {
        const baseUrl = OpenAPI.BASE || ""
        const token = localStorage.getItem("access_token") || ""
        const response = await fetch(`${baseUrl}/api/v1/recommends/leave-plan?year=${year}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        if (!response.ok) {
            throw new Error("Failed to fetch recommendations")
        }
        return response.json()
    },
}

export const Route = createFileRoute("/_layout/recommendations")({
    component: Recommendations,
})


function PendingRecommendations() {
    const skeletons = Array(5)
        .fill(null)
        .map((_, i) => (
            <Table.Row key={i}>
                <Table.Cell><Skeleton height="20px" /></Table.Cell>
                <Table.Cell><Skeleton height="20px" /></Table.Cell>
                <Table.Cell><Skeleton height="20px" /></Table.Cell>
                <Table.Cell><Skeleton height="20px" /></Table.Cell>
                <Table.Cell><Skeleton height="20px" /></Table.Cell>
            </Table.Row>
        ))
    return (
        <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader w="sm">Leave Date</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Bridge Holiday</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Team Workload</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Preference Score</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Predicted Score</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>{skeletons}</Table.Body>
        </Table.Root>
    )
}

function RecommendationsTable({ year }: { year: number }) {
    const { data, isLoading } = useQuery({
        queryKey: ["recommendations", year],
        queryFn: () => RecommendationsService.getRecommendations({ year }),
    })
    const recommendations = data?.data ?? []
    if (isLoading) {
        return <PendingRecommendations />
    }
    if (recommendations.length === 0) {
        return (
            <Text fontSize="sm" color="gray.500" px={2} py={2}>
                No recommendations available for {year}.
            </Text>
        )
    }
    return (
        <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader w="sm">Leave Date</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Bridge Holiday</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Team Workload</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Preference Score</Table.ColumnHeader>
                    <Table.ColumnHeader w="sm">Predicted Score</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {recommendations.map((rec, index) => (
                    <Table.Row key={index}>
                        <Table.Cell>{rec.leave_date}</Table.Cell>
                        <Table.Cell>
                            <Badge colorPalette={rec.bridge_holiday ? "green" : "gray"}>
                                {rec.bridge_holiday ? "Bridge" : "No"}
                            </Badge>
                        </Table.Cell>
                        <Table.Cell>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <span>
                                        <Badge colorPalette={rec.team_workload < 0.4 ? "green" : rec.team_workload < 0.7 ? "yellow" : "red"}>
                                            {rec.team_workload.toFixed(2)}
                                        </Badge>
                                    </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    Lower is better
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Table.Cell>
                        <Table.Cell>
                            <Badge colorPalette={rec.preference_score > 0.7 ? "green" : rec.preference_score > 0.4 ? "yellow" : "red"}>
                                {rec.preference_score.toFixed(2)}
                            </Badge>
                        </Table.Cell>
                        <Table.Cell>
                            <Badge colorPalette={rec.predicted_score > 0.7 ? "green" : rec.predicted_score > 0.4 ? "yellow" : "red"}>
                                {rec.predicted_score.toFixed(2)}
                            </Badge>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    )
}

function Recommendations() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [inputYear, setInputYear] = useState(year.toString())

    const handleYearSubmit = () => {
        const newYear = Number.parseInt(inputYear)
        if (!Number.isNaN(newYear) && newYear >= 2000 && newYear <= 2100) {
            setYear(newYear)
        }
    }

    return (
        <Container maxW="full">
            <Heading size="lg" pt={12}>
                Leave Plan Recommendations
            </Heading>

            <Flex gap={4} my={4} alignItems="center">
                <Text>Year:</Text>
                <Input
                    value={inputYear}
                    onChange={(e) => setInputYear(e.target.value)}
                    placeholder="2025"
                    type="number"
                    width="150px"
                />
                <Button onClick={handleYearSubmit}>Get Recommendations</Button>
            </Flex>

            <RecommendationsTable year={year} />
        </Container>
    )
}
